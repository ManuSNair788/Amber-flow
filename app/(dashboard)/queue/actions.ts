'use server'

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function handleApprove(formData: FormData) {
  const approvalId = formData.get('approvalId') as string;
  if (!approvalId) return;

  await supabase
    .from('approvals')
    .update({ status: 'approved' })
    .eq('id', approvalId);

  revalidatePath('/queue');
}

export async function handleReject(formData: FormData) {
  const approvalId = formData.get('approvalId') as string;
  if (!approvalId) return;

  await supabase
    .from('approvals')
    .update({ status: 'rejected' })
    .eq('id', approvalId);

  revalidatePath('/queue');
}
