'use server'

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { groq } from '@/lib/groq';

export async function handleGenerateDraft(formData: FormData) {
  const approvalId = formData.get('approvalId') as string;
  if (!approvalId) return;

  const { data: approval } = await supabase
    .from('approvals')
    .select('raw_slack_context, students(id, name, notes)')
    .eq('id', approvalId)
    .single();

  if (!approval) return;

  const studentName = (approval.students as any)?.name || 'Unknown Lead';
  const notes = (approval.students as any)?.notes || '';
  
  const draftPrompt = `
      Write a short, professional WhatsApp follow-up message to the partner regarding this lead based on the notes. Do not include subject lines or formal email signatures.
      Student: ${studentName}
      Notes: ${notes}
  `;

  try {
    const draftCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "You are a helpful partnership operations assistant drafting WhatsApp messages." },
        { role: "user", content: draftPrompt }
      ],
      model: "llama-3.1-8b-instant",
    });
    
    const draftedMessage = draftCompletion.choices[0]?.message?.content || '';
    
    if (draftedMessage) {
      await supabase.from('approvals').update({ message: draftedMessage }).eq('id', approvalId);
      await supabase.from('activities').insert({
        student_id: (approval.students as any)?.id,
        action: 'AI generated a WhatsApp draft message',
        status: 'Drafted'
      });
      revalidatePath('/queue');
    }
  } catch(e) {
    console.error("Draft generation failed:", e);
  }
}

export async function handleApproveOnly(formData: FormData) {
  const approvalId = formData.get('approvalId') as string;
  if (!approvalId) return;

  const { data: approval } = await supabase
    .from('approvals')
    .update({ status: 'approved' })
    .eq('id', approvalId)
    .select('student_id')
    .single();

  if (approval) {
    await supabase.from('activities').insert({
      student_id: approval.student_id,
      action: `Message approved (Manual check)`,
      status: 'Approved'
    });
  }

  revalidatePath('/queue');
}

export async function handleSendToWhatsApp(formData: FormData) {
  const approvalId = formData.get('approvalId') as string;
  const waGroupId = formData.get('waGroupId') as string;
  if (!approvalId) return;

  const { data: approval } = await supabase
    .from('approvals')
    .select('student_id, message')
    .eq('id', approvalId)
    .single();

  if (approval) {
    // Attempt to send message via the new WhatsApp Bot Microservice
    try {
      // In production, this URL would be an env variable pointing to your Render/Railway instance
      const BOT_URL = process.env.WHATSAPP_BOT_URL || 'http://localhost:3001';
      
      const response = await fetch(`${BOT_URL}/send-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId: waGroupId, // This assumes waGroupId is mapped to the internal WA Group ID (e.g. 1234@g.us)
          message: approval.message
        })
      });

      if (!response.ok) {
        console.error('WhatsApp Bot failed to send message:', await response.text());
      }
    } catch (e) {
      console.error('Failed to connect to WhatsApp bot:', e);
    }

    await supabase.from('activities').insert({
      student_id: approval.student_id,
      action: `Message sent to WhatsApp ${waGroupId ? `(${waGroupId})` : ''}`,
      status: 'Message Sent'
    });
  }

  revalidatePath('/queue');
}

export async function handleReject(formData: FormData) {
  const approvalId = formData.get('approvalId') as string;
  if (!approvalId) return;

  const { data: approval } = await supabase
    .from('approvals')
    .update({ status: 'rejected' })
    .eq('id', approvalId)
    .select('student_id')
    .single();

  if (approval) {
    await supabase.from('activities').insert({
      student_id: approval.student_id,
      action: 'Follow-up message rejected',
      status: 'Rejected'
    });
  }

  revalidatePath('/queue');
}

export async function handleCreateWaGroup(formData: FormData) {
  const studentId = formData.get('studentId') as string;
  if (!studentId) return;

  await supabase.from('activities').insert({
    student_id: studentId,
    action: 'WhatsApp Group created successfully',
    status: 'Group Created'
  });

  revalidatePath('/queue');
}

export async function handleDnpQuickAction(formData: FormData) {
  const approvalId = formData.get('approvalId') as string;
  const waGroupId = formData.get('waGroupId') as string;
  if (!approvalId) return;

  const { data: approval } = await supabase
    .from('approvals')
    .update({ status: 'rejected' })
    .eq('id', approvalId)
    .select('student_id, students(name)')
    .single();

  if (approval) {
    const studentName = (approval.students as any)?.name || 'the student';
    const dnpMessage = `Hi Team, we attempted to contact ${studentName} but they did not pick up (DNP). We will attempt to follow up again later.`;

    try {
      const BOT_URL = process.env.WHATSAPP_BOT_URL || 'http://localhost:3001';
      
      const response = await fetch(`${BOT_URL}/send-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId: waGroupId,
          message: dnpMessage
        })
      });

      if (!response.ok) {
        console.error('WhatsApp Bot failed to send DNP message:', await response.text());
      }
    } catch (e) {
      console.error('Failed to connect to WhatsApp bot:', e);
    }

    await supabase.from('activities').insert({
      student_id: approval.student_id,
      action: `DNP Quick Action sent to WhatsApp`,
      status: 'DNP Handled'
    });
  }

  revalidatePath('/queue');
}

export async function handleEditMessage(approvalId: string, newMessage: string) {
  if (!approvalId || !newMessage) return { success: false, error: 'Missing parameters' };

  const { error } = await supabase
    .from('approvals')
    .update({ message: newMessage })
    .eq('id', approvalId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/queue');
  return { success: true };
}
