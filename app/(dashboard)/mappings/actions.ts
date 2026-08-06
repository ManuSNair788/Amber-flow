'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateMapping(partnerId: string, slackChannel: string, whatsappNumber: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('partners')
    .update({ 
      slack_channel: slackChannel || null, 
      whatsapp_number: whatsappNumber || null
    })
    .eq('id', partnerId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/mappings')
  return { success: true }
}
