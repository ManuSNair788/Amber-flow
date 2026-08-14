'use client'

import { useState, useTransition } from 'react'
import { updateMapping, deletePartner, updatePartnerName } from './actions'
import { Check, Save, Trash2, Edit2, X } from 'lucide-react'

export function MappingForm({ 
  partner 
}: { 
  partner: any 
}) {
  const [isEditingName, setIsEditingName] = useState(false)
  const [partnerName, setPartnerName] = useState(partner.name)
  const [isPending, startTransition] = useTransition()
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
    
    // Update mapping
    await updateMapping(partner.id, numToSave, groupToSave)
    
    // Update name if changed
    if (partnerName !== partner.name) {
      await updatePartnerName(partner.id, partnerName)
    }
    
    setLoading(false)
    setIsEditingName(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete ${partner.name}?`)) {
      startTransition(() => {
        deletePartner(partner.id)
      })
    }
  }

  const isDirty = 
    whatsapp !== (partner.whatsapp_number || '') || 
    whatsappGroup !== (partner.whatsapp_group_id || '') ||
    mappingType !== (partner.whatsapp_group_id ? 'group' : 'individual') ||
    partnerName !== partner.name

  return (
    <div className={`grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-50 transition-colors ${isPending ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="col-span-3 flex items-center gap-2 group">
        {isEditingName ? (
          <input
            type="text"
            value={partnerName}
            onChange={(e) => setPartnerName(e.target.value)}
            className="w-full text-sm px-2 py-1 border border-indigo-500 rounded focus:outline-none"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
        ) : (
          <>
            <span className="font-medium text-slate-900">{partner.name}</span>
            <button onClick={() => setIsEditingName(true)} className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-indigo-600 transition-opacity">
              <Edit2 className="w-3 h-3" />
            </button>
          </>
        )}
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
      <div className="col-span-1 text-right flex items-center justify-end gap-1">
        {saved ? (
          <button disabled className="inline-flex items-center justify-center p-2 text-emerald-600 bg-emerald-50 rounded-lg">
            <Check className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSave}
            disabled={loading || !isDirty}
            className="inline-flex items-center justify-center p-2 text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:bg-slate-100 disabled:text-slate-400 rounded-lg transition-colors"
            title="Save Mapping"
          >
            <Save className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={handleDelete}
          className="inline-flex items-center justify-center p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete Partner"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
