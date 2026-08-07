'use server'

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function handleApprove(formData: FormData) {
  const approvalId = formData.get('approvalId') as string;
  const waNumber = formData.get('waNumber') as string;
  if (!approvalId) return;

  const { data: approval } = await supabase
    .from('approvals')
    .update({ status: 'approved' })
    .eq('id', approvalId)
    .select('student_id, message')
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
          groupId: waNumber, // This assumes waNumber is mapped to the internal WA Group ID (e.g. 1234@g.us)
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
      action: `Message approved & sent to WhatsApp ${waNumber ? `(${waNumber})` : ''}`,
      status: 'Approved'
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
