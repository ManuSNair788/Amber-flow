'use server'

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function handleApprove(formData: FormData) {
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
      action: 'Follow-up message approved manually',
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
      action: 'Follow-up message rejected manually',
      status: 'Rejected'
    });
  }

  revalidatePath('/queue');
}
