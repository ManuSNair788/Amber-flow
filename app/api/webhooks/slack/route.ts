import { NextResponse } from 'next/server';
import { groq } from '@/lib/groq';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const headers = req.headers;
    
    // 1. Signature Validation
    const slackSignature = headers.get('x-slack-signature');
    const slackTimestamp = headers.get('x-slack-request-timestamp');
    const secret = process.env.SLACK_SIGNING_SECRET;

    if (secret && slackSignature && slackTimestamp) {
      const time = Math.floor(Date.now() / 1000);
      if (Math.abs(time - parseInt(slackTimestamp, 10)) > 300) {
        return NextResponse.json({ error: "Request too old" }, { status: 400 });
      }

      const sigBaseString = `v0:${slackTimestamp}:${rawBody}`;
      const mySignature = 'v0=' + crypto.createHmac('sha256', secret).update(sigBaseString).digest('hex');

      // Prevent timing attacks
      if (mySignature.length !== slackSignature.length || !crypto.timingSafeEqual(Buffer.from(mySignature, 'utf8'), Buffer.from(slackSignature, 'utf8'))) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    let body;
    try {
      body = JSON.parse(rawBody);
    } catch(e) {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    // 2. Handle Slack Retries
    if (headers.get('x-slack-retry-num')) {
      // Acknowledge retries to prevent duplicate processing since Slack expects < 3s response
      return NextResponse.json({ status: 'ignored_retry' });
    }

    // 3. Handle Slack URL Verification Challenge
    if (body.type === 'url_verification') {
      return NextResponse.json({ challenge: body.challenge });
    }

    // 4. Ignore non-message events or bot messages
    if (body.type !== 'event_callback' || body.event?.type !== 'message' || body.event?.bot_id) {
      return NextResponse.json({ status: 'ignored' });
    }

    const text = body.event.text;
    if (!text) {
      return NextResponse.json({ error: "Missing text payload" }, { status: 400 });
    }

    // 5. Verify the Official User was Tagged (Eavesdrop Logic)
    // The bot listens to all messages in the channel (message.channels event)
    // but ONLY processes it if YOUR official Slack ID is tagged in the text.
    const mySlackId = process.env.MY_SLACK_USER_ID; 
    
    // If the environment variable is set, enforce the filtering rule
    // if (mySlackId && !text.includes(`<@${mySlackId}>`)) {
    //    // Ignore the message because you were not tagged
    //    return NextResponse.json({ status: 'ignored_not_tagged' });
    // }

    // 6. AI Extraction (using Groq)
    const extractionPrompt = `
      Extract the following information from the message below and output ONLY valid JSON.
      Required keys: "student_name", "partner_name", "status", "notes", "tagged_users" (array of strings, e.g. ["<@U1234>"]).
      If you can't find a value, use null.
      Message: "${text}"
    `;

    const extractCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "You are a JSON-only data extraction bot." },
        { role: "user", content: extractionPrompt }
      ],
      model: "llama-3.1-8b-instant",
      response_format: { type: "json_object" }
    });

    const extractedStr = extractCompletion.choices[0]?.message?.content || '{}';
    let extracted;
    try {
      extracted = JSON.parse(extractedStr);
    } catch(e) {
      console.error("AI Output parsing failed:", extractedStr);
      return NextResponse.json({ error: "Failed to parse AI output" }, { status: 500 });
    }

    // 6. Resolve Partner ID
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
         const { data: newPartner } = await supabase.from('partners').insert({ name: extracted.partner_name }).select('id').single();
         if (newPartner) partnerId = newPartner.id;
      }
    }

    // 7. Insert Student
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
      console.error("Student insert failed:", studentError);
      return NextResponse.json({ error: "Failed to insert student" }, { status: 500 });
    }

    // 8. Draft Generation (using Groq)
    const taggedUsersStr = extracted.tagged_users && extracted.tagged_users.length > 0 
      ? `\nTagged Slack Users: ${extracted.tagged_users.join(', ')}. Include their names or mentions if relevant.` 
      : '';

    const draftPrompt = `
      Write a short, professional WhatsApp follow-up message to the partner regarding this lead based on the notes. Do not include subject lines or formal email signatures.${taggedUsersStr}
      Student: ${extracted.student_name}
      Notes: ${extracted.notes}
    `;

    let draftedMessage = 'Error generating draft.';
    try {
      const draftCompletion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: "You are a helpful partnership operations assistant drafting WhatsApp messages." },
          { role: "user", content: draftPrompt }
        ],
        model: "llama-3.1-8b-instant",
      });
      draftedMessage = draftCompletion.choices[0]?.message?.content || draftedMessage;
    } catch(e) {
      console.error("Draft generation failed:", e);
      // We continue to insert the queue item even if draft failed, so the human can manually draft it.
    }

    // 9. Insert Approval Queue with raw slack context
    await supabase.from('approvals').insert({
      student_id: student.id,
      raw_slack_context: text,
      message: draftedMessage,
      status: 'pending'
    });

    // 10. Log Activity
    await supabase.from('activities').insert({
      student_id: student.id,
      action: 'Lead extracted from Slack & Added to Queue',
      status: 'New'
    });

    return NextResponse.json({ success: true, student, draftedMessage });

  } catch (error: any) {
    console.error("Webhook unexpected error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

