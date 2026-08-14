'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { createPartner } from './actions'

export function AddPartnerForm() {
  const [name, setName] = useState('')
  const [mappingType, setMappingType] = useState<'individual' | 'group'>('individual')
  const [destination, setDestination] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !destination) return

    setLoading(true)
    const res = await createPartner(name, mappingType, destination)
    setLoading(false)

    if (res?.success) {
      setName('')
      setDestination('')
    } else {
      alert(res?.error || 'Failed to create partner')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center w-full max-w-3xl">
      <input 
        type="text" 
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        placeholder="New partner name..." 
        className="text-sm px-3 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-48"
      />
      
      <div className="flex bg-slate-100 p-0.5 rounded-md shrink-0 border border-slate-200">
        <button
          type="button"
          onClick={() => setMappingType('individual')}
          className={`text-xs font-medium px-3 py-1 rounded-sm transition-colors ${mappingType === 'individual' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Individual
        </button>
        <button
          type="button"
          onClick={() => setMappingType('group')}
          className={`text-xs font-medium px-3 py-1 rounded-sm transition-colors ${mappingType === 'group' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          WA Group
        </button>
      </div>

      <input 
        type="text" 
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
        required
        placeholder={mappingType === 'individual' ? "Phone number (+123...)" : "Group invite link..."}
        className="text-sm px-3 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-1 w-full"
      />

      <button 
        type="submit" 
        disabled={loading || !name || !destination}
        className="flex items-center justify-center gap-1 text-sm bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 shrink-0 w-full sm:w-auto"
      >
        <Plus className="w-4 h-4" /> Add
      </button>
    </form>
  )
}
