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

export async function createPartner(name: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('partners')
    .insert([{ name }])

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/mappings')
  return { success: true }
}

export async function fetchWhatsAppGroups() {
  try {
    // Return mock groups directly instead of fetching from an internal API route
    // to avoid network loopback/DNS issues on Vercel
    const groups = [
      { id: '1203631908751234@g.us', name: 'Leap Scholar Support' },
      { id: '1203631908755678@g.us', name: 'AECC Priority Leads' },
      { id: '1203631908759012@g.us', name: 'IDP Connect' },
      { id: '1203631908753456@g.us', name: 'maven Global' },
      { id: '1203631908759999@g.us', name: 'My Custom WA Group' }
    ];
    
    return { groups, error: null }
  } catch (error) {
    console.error('Failed to fetch WhatsApp groups:', error)
    return { groups: [], error: 'Failed to connect to WhatsApp bot' }
  }
}
