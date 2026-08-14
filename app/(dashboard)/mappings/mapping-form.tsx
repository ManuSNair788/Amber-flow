'use client'

import { useState } from 'react'
import { updateMapping } from './actions'
import { Check, Save } from 'lucide-react'

export function MappingForm({ 
  partner 
}: { 
  partner: any 
}) {
  const [whatsapp, setWhatsapp] = useState(partner.whatsapp_number || '')
  const [whatsappGroup, setWhatsappGroup] = useState(partner.whatsapp_group_id || '')
  const [mappingType, setMappingType] = useState<'individual' | 'group'>(
    partner.whatsapp_group_id ? 'group' : 'individual'
  )
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    setSaved(false)
    
    // Clear the unused field based on the selected type
    const numToSave = mappingType === 'individual' ? whatsapp : null;
    const groupToSave = mappingType === 'group' ? whatsappGroup : null;
    
    const res = await updateMapping(partner.id, numToSave, groupToSave)
    setLoading(false)
    if (res?.success) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } else {
      alert(res?.error || 'Failed to save')
    }
  }

  const isDirty = 
    whatsapp !== (partner.whatsapp_number || '') || 
    whatsappGroup !== (partner.whatsapp_group_id || '') ||
    mappingType !== (partner.whatsapp_group_id ? 'group' : 'individual')

  return (
    <div className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-50 transition-colors">
      <div className="col-span-3 font-medium text-slate-900">
        {partner.name}
      </div>
      
      {/* Mapping Type Toggle */}
      <div className="col-span-3">
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setMappingType('individual')}
            className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-colors ${mappingType === 'individual' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Individual
          </button>
          <button
            onClick={() => setMappingType('group')}
            className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-colors ${mappingType === 'group' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            WA Group
          </button>
        </div>
      </div>

      <div className="col-span-5">
        {mappingType === 'individual' ? (
          <input
            type="text"
            placeholder="e.g. +1234567890 (Direct Number)"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
          />
        ) : (
          <input
            type="text"
            placeholder="e.g. https://chat.whatsapp.com/XXXXX (Invite Link)"
            value={whatsappGroup}
            onChange={(e) => setWhatsappGroup(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
          />
        )}
      </div>
      <div className="col-span-1 text-right">
        {saved ? (
          <button disabled className="inline-flex items-center justify-center p-2 text-emerald-600 bg-emerald-50 rounded-lg">
            <Check className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={handleSave}
            disabled={loading || !isDirty}
            className="inline-flex items-center justify-center p-2 text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:bg-slate-100 disabled:text-slate-400 rounded-lg transition-colors"
            title="Save Mapping"
          >
            <Save className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  )
}
