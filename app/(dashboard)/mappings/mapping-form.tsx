'use client'

import { useState } from 'react'
import { updateMapping } from './actions'
import { Check, Save } from 'lucide-react'

export function MappingForm({ partner }: { partner: any }) {
  const [whatsapp, setWhatsapp] = useState(partner.whatsapp_number || '')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    setSaved(false)
    const res = await updateMapping(partner.id, partner.slack_channel || '', whatsapp)
    setLoading(false)
    if (res?.success) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } else {
      alert(res?.error || 'Failed to save')
    }
  }

  const isDirty = whatsapp !== (partner.whatsapp_number || '')

  return (
    <div className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-50 transition-colors">
      <div className="col-span-3 font-medium text-slate-900">
        {partner.name}
      </div>
      <div className="col-span-8">
        <input
          type="text"
          placeholder="e.g. +1234567890 (Partner WA Number)"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
        />
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
