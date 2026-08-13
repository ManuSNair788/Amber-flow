'use client'

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function SimulateWebhook() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSimulate = async (isFollowup: boolean) => {
    setLoading(true);
    try {
      const payload: any = {
        type: "event_callback",
        team_id: "T12345678",
        event: {
          type: "message",
          channel: "C12345678",
          ts: "1723555555.123459",
          text: isFollowup ? "Is there any update on this lead?" : "🔗 amberstudent.com/dashboard/leads/812345 maven/ counselor told him to book after cas/ <@Manu Nair> <@Rishabh>"
        }
      };

      if (isFollowup) {
        payload.event.thread_ts = "1723555555.123459"; // Match the parent timestamp
        payload.event.ts = Date.now().toString(); // New message timestamp
      }

      await fetch('/api/webhooks/slack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      router.refresh();
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  return (
    <div className="flex flex-col gap-2">
      <button 
        onClick={() => handleSimulate(false)}
        disabled={loading}
        className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-50 text-sm font-medium text-slate-700 transition-colors border border-transparent hover:border-slate-200 flex justify-between items-center"
      >
        <span>+ Simulate Slack Lead</span>
        {loading && <RefreshCw className="w-4 h-4 animate-spin text-indigo-500" />}
      </button>

      <button 
        onClick={() => handleSimulate(true)}
        disabled={loading}
        className="w-full text-left px-4 py-3 rounded-lg hover:bg-indigo-50 text-sm font-medium text-indigo-700 transition-colors border border-transparent hover:border-indigo-200 flex justify-between items-center"
      >
        <span>+ Simulate Follow-up</span>
        {loading && <RefreshCw className="w-4 h-4 animate-spin text-indigo-500" />}
      </button>
    </div>
  );
}
