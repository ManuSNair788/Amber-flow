'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateMapping(partnerId: string, whatsappNumber: string, whatsappGroupId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('partners')
    .update({ 
      whatsapp_number: whatsappNumber || null,
      whatsapp_group_id: whatsappGroupId || null
    })
    .eq('id', partnerId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/mappings')
  return { success: true }
}
