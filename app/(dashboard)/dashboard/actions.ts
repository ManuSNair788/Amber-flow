'use server'

import { supabase } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export async function draftDnpFollowUp(formData: FormData) {
  const studentId = formData.get('studentId') as string
  const studentName = formData.get('studentName') as string
  const partnerName = formData.get('partnerName') as string

  if (!studentId) return

  const message = `Hi ${partnerName} Team, \n\nWe noticed that lead ${studentName} has been marked as DNP (Did Not Pick) after multiple contact attempts. Could you please check on your end and try reaching out via WhatsApp? \n\nLet us know if you get an update.`

  await supabase.from('approvals').insert({
    student_id: studentId,
    raw_slack_context: `System Action: DNP Follow-up generated for ${studentName}`,
    message: message,
    status: 'pending'
  })

  await supabase.from('activities').insert({
    student_id: studentId,
    action: 'DNP Follow-up drafted to queue',
    status: 'DNP'
  })

  revalidatePath('/dashboard')
  revalidatePath('/queue')
}
