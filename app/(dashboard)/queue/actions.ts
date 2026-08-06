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
    .select('student_id')
    .single();

  if (approval) {
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
