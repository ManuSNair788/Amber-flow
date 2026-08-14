'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { MappingForm } from './mapping-form'

export function MappingsClient({ partners }: { partners: any[] }) {
  const [search, setSearch] = useState('')

  const filteredPartners = partners?.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  ) || []

  return (
    <div className="space-y-4">
      <div className="relative border-b border-slate-200 bg-slate-50 p-3">
        <Search className="w-5 h-5 absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search partners..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
        />
      </div>

      <div className="divide-y divide-slate-100">
        {filteredPartners.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No partners found.
          </div>
        ) : (
          filteredPartners.map((partner) => (
            <MappingForm 
              key={partner.id} 
              partner={partner} 
            />
          ))
        )}
      </div>
    </div>
  )
}
