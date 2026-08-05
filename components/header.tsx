'use client'

import { Calendar, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';

export function Header() {
  const [dateStr, setDateStr] = useState('');
  const [greeting, setGreeting] = useState('Good morning');

  useEffect(() => {
    const now = new Date();
    setDateStr(now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }));
    
    const hour = now.getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  return (
    <header className="h-24 px-8 flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          {greeting}, Manu <span className="text-2xl wave">👋</span>
        </h2>
        <p className="text-slate-500 mt-1 text-sm font-medium">Here's what's happening with your partnerships today.</p>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 bg-white border border-slate-200 shadow-sm rounded-lg px-4 py-2 text-sm font-medium text-slate-700 cursor-pointer hover:bg-slate-50 transition-colors">
          <Calendar className="w-4 h-4 text-slate-500" />
          <span suppressHydrationWarning>{dateStr || 'Loading...'}</span>
        </div>
        
        <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
          <Bell className="w-6 h-6" />
          <span className="absolute top-1 right-1 w-4 h-4 bg-purple-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-[#F8FAFC]">3</span>
        </button>

        <div className="flex items-center gap-3 cursor-pointer">
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-200">
            M
          </div>
          <span className="font-medium text-slate-700">Manu</span>
        </div>
      </div>
    </header>
  );
}
