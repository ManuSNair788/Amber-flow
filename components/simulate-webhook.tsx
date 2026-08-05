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
          text: "Hey POAI, we just got a new lead from AECC. Her name is Maya Patel and she's looking to study CS in the US next Fall. She hasn't paid the deposit yet."
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
