import { createClient } from '@/utils/supabase/server'
import { Network, MessageSquare, Phone, Building2 } from 'lucide-react'
import { MappingForm } from './mapping-form'

export const metadata = {
  title: 'Channel Mappings | POAI'
}

export default async function MappingsPage() {
  const supabase = await createClient()
  const { data: partners } = await supabase
    .from('partners')
    .select('*')
    .order('name')

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Network className="w-6 h-6 text-indigo-600" />
          Channel & Contact Mappings
        </h1>
        <p className="text-slate-500 mt-1">
          Map specific Slack channels and WhatsApp numbers for each of your university partners.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <div className="col-span-3 flex items-center gap-2">
            <Building2 className="w-4 h-4" /> Partner
          </div>
          <div className="col-span-4 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#E01E5A]" /> Slack Channel ID
          </div>
          <div className="col-span-4 flex items-center gap-2">
            <Phone className="w-4 h-4 text-[#25D366]" /> WhatsApp Number
          </div>
          <div className="col-span-1 text-center">Action</div>
        </div>
        
        <div className="divide-y divide-slate-100">
          {partners?.map((partner) => (
            <MappingForm key={partner.id} partner={partner} />
          ))}
          
          {(!partners || partners.length === 0) && (
            <div className="p-8 text-center text-slate-500">
              No partners found.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
