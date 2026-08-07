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

export async function fetchWhatsAppGroups() {
  try {
    const BOT_URL = process.env.WHATSAPP_BOT_URL || 'http://localhost:3001'
    const response = await fetch(`${BOT_URL}/groups`, { cache: 'no-store' })
    
    if (!response.ok) {
      return { groups: [], error: 'Bot is unreachable' }
    }
    
    const data = await response.json()
    return { groups: data.groups || [], error: null }
  } catch (error) {
    console.error('Failed to fetch WhatsApp groups:', error)
    return { groups: [], error: 'Failed to connect to WhatsApp bot' }
  }
}
