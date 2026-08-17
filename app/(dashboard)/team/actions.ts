'use server'

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function addTeamMember(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const slack_id = formData.get('slack_id') as string;
  const role = formData.get('role') as string;

  if (!name || !role) {
    return { success: false, error: 'Name and Role are required' };
  }

  if (role === 'KAM' && !slack_id) {
    return { success: false, error: 'Slack ID is required for KAMs.' };
  }

  // Basic validation to strip <@ > if user pasted raw slack tag
  let cleanSlackId = slack_id;
  if (cleanSlackId) {
    cleanSlackId = cleanSlackId.replace('<@', '').replace('>', '').trim();
  }

  const { data, error } = await supabase
    .from('team_members')
    .insert([{ name, email, slack_id: cleanSlackId, role }]);

  if (error) {
    console.error('Failed to add team member:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/team');
  return { success: true };
}

export async function deleteTeamMember(id: string) {
  if (!id) return;

  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Failed to delete team member:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/team');
  return { success: true };
}
