'use server'

import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  
  if (!email || !email.endsWith('@amberstudent.com')) {
    return { error: 'Invalid email domain. Must be @amberstudent.com' }
  }

  const supabase = createClient()

  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'https://amber-flow-virid.vercel.app';

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { error: null }
}
