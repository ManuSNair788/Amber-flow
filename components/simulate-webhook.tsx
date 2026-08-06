'use client'

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function SimulateWebhook() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSimulate = async () => {
    setLoading(true);
    try {
      await fetch('/api/webhooks/slack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: "event_callback",
          event: {
            type: "message",
            text: "🔗 amberstudent.com/dashboard/leads/812345 maven/ counselor told him to book after cas/ <@Manu Nair> <@Rishabh>"
          }
        })
      });
      router.refresh();
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  return (
    <button 
      onClick={handleSimulate}
      disabled={loading}
      className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-50 text-sm font-medium text-slate-700 transition-colors border border-transparent hover:border-slate-200 flex justify-between items-center"
    >
      <span>+ Simulate Slack Lead</span>
      {loading && <RefreshCw className="w-4 h-4 animate-spin text-indigo-500" />}
    </button>
  );
}
