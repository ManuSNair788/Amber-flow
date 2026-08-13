'use client'

import { Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export function LiveNotifications() {
  const [newLeadsCount, setNewLeadsCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    // Subscribe to new students (tagged leads)
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'students',
        },
        (payload) => {
          console.log('New lead received!', payload);
          setNewLeadsCount((prev) => prev + 1);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'approvals',
        },
        (payload) => {
          if (payload.new.is_followup) {
            console.log('New follow-up received!', payload);
            setNewLeadsCount((prev) => prev + 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleRefresh = () => {
    setNewLeadsCount(0);
    router.refresh(); // Tells Next.js to re-fetch Server Components (Dashboard list, etc.)
  };

  return (
    <button 
      onClick={handleRefresh}
      className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors"
      title={newLeadsCount > 0 ? `${newLeadsCount} new updates. Click to refresh.` : "No new updates"}
    >
      <Bell className="w-6 h-6" />
      {newLeadsCount > 0 && (
        <span className="absolute top-1 right-1 w-4 h-4 bg-purple-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-[#F8FAFC] animate-bounce">
          {newLeadsCount}
        </span>
      )}
    </button>
  );
}
