import { NextResponse } from 'next/server';
import { groq } from '@/lib/groq';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Handle Slack URL Verification Challenge
    if (body.type === 'url_verification') {
      return NextResponse.json({ challenge: body.challenge });
    }

    // 2. Ignore non-message events or bot messages
    if (body.type !== 'event_callback' || body.event?.type !== 'message' || body.event?.bot_id) {
      return NextResponse.json({ status: 'ignored' });
    }

    const text = body.event.text;
    if (!text) {
      return NextResponse.json({ error: "Missing text payload" }, { status: 400 });
    }

    // 3. AI Extraction (using Groq)
    const extractionPrompt = `
      Extract the following information from the message below and output ONLY valid JSON.
      Required keys: "student_name", "partner_name", "status", "notes".
      If you can't find a value, use null.
      Message: "${text}"
    `;

    const extractCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "You are a JSON-only data extraction bot." },
        { role: "user", content: extractionPrompt }
      ],
      model: "llama3-8b-8192",
      response_format: { type: "json_object" }
    });

    const extractedStr = extractCompletion.choices[0]?.message?.content || '{}';
    let extracted;
    try {
      extracted = JSON.parse(extractedStr);
    } catch(e) {
      return NextResponse.json({ error: "Failed to parse AI output" }, { status: 500 });
    }

    // 4. Resolve Partner ID
    let partnerId = null;
    if (extracted.partner_name) {
      const { data: partnerData } = await supabase
        .from('partners')
        .select('id')
        .ilike('name', `%${extracted.partner_name}%`)
        .single();
      
      if (partnerData) {
        partnerId = partnerData.id;
      } else {
         // Create it if it doesn't exist
         const { data: newPartner } = await supabase.from('partners').insert({ name: extracted.partner_name }).select('id').single();
         if (newPartner) partnerId = newPartner.id;
      }
    }

    // 5. Insert Student
    const prospect_id = Math.floor(100000 + Math.random() * 900000).toString();
    const { data: student, error: studentError } = await supabase
      .from('students')
      .insert({
        prospect_id,
        name: extracted.student_name || 'Unknown Lead',
        partner_id: partnerId,
        status: extracted.status || 'New',
        notes: extracted.notes
      })
      .select('id')
      .single();

    if (studentError || !student) {
      return NextResponse.json({ error: "Failed to insert student" }, { status: 500 });
    }

    // 6. Draft Generation (using Groq)
    const draftPrompt = `
      Write a short, professional WhatsApp follow-up message to the partner regarding this lead based on the notes. Do not include subject lines or formal email signatures.
      Student: ${extracted.student_name}
      Notes: ${extracted.notes}
    `;

    const draftCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "You are a helpful partnership operations assistant drafting WhatsApp messages." },
        { role: "user", content: draftPrompt }
      ],
      model: "llama3-8b-8192",
    });

    const draftedMessage = draftCompletion.choices[0]?.message?.content || 'Error generating draft.';

    // 7. Insert Approval Queue with raw slack context
    await supabase.from('approvals').insert({
      student_id: student.id,
      raw_slack_context: text, // Saving the exact raw Slack payload
      message: draftedMessage,
      status: 'pending'
    });

    // 8. Log Activity
    await supabase.from('activities').insert({
      student_id: student.id,
      action: 'Lead extracted from Slack',
      status: 'New'
    });

    return NextResponse.json({ success: true, student, draftedMessage });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
