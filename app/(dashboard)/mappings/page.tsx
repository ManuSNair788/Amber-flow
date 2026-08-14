import { createClient } from '@/utils/supabase/server'
import { Network, Plus, Phone, Users } from 'lucide-react'
import { createPartner } from './actions'
import { MappingsClient } from './mappings-client'

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
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Partner Mappings</h2>
          <form action={async (formData) => {
            'use server';
            const name = formData.get('partnerName') as string;
            if (name) await createPartner(name);
          }} className="flex gap-2">
            <input 
              type="text" 
              name="partnerName"
              required
              placeholder="New partner name..." 
              className="text-sm px-3 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button type="submit" className="flex items-center gap-1 text-sm bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700 transition-colors font-medium">
              <Plus className="w-4 h-4" /> Add Partner
            </button>
          </form>
        </div>
        
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-200 bg-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <div className="col-span-3">Partner Name</div>
          <div className="col-span-3 text-center">Type</div>
          <div className="col-span-5"><Phone className="w-3 h-3 inline mr-1 text-[#25D366]"/> / <Users className="w-3 h-3 inline mr-1 text-[#25D366]"/> Destination</div>
          <div className="col-span-1 text-right">Action</div>
        </div>
        
        <MappingsClient partners={partners || []} />
      </div>
    </div>
  )
}
