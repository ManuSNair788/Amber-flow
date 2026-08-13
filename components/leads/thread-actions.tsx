'use client'

import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { handleSendToWhatsApp, handleReject } from '@/app/(dashboard)/queue/actions';

export function ThreadActions({ approvalId, waGroupId }: { approvalId: string, waGroupId: string }) {
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onApprove = async (formData: FormData) => {
    setIsSubmitting(true);
    await handleSendToWhatsApp(formData);
    // Next.js router handles revalidation via Server Actions.
    setIsSubmitting(false);
  };

  const onReject = async (formData: FormData) => {
    setIsSubmitting(true);
    await handleReject(formData);
    setIsSubmitting(false);
    setShowRejectInput(false);
  };

  return (
    <div className="mt-3 flex gap-2">
      <form action={onApprove} className="flex-1">
        <input type="hidden" name="approvalId" value={approvalId} />
        <input type="hidden" name="waGroupId" value={waGroupId} />
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded shadow-sm disabled:opacity-50"
        >
          <Check className="w-3 h-3" /> Approve Follow-up
        </button>
      </form>

      {!showRejectInput ? (
        <button 
          type="button" 
          onClick={() => setShowRejectInput(true)} 
          disabled={isSubmitting}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded transition-colors disabled:opacity-50"
        >
          <X className="w-3 h-3" /> Reject
        </button>
      ) : (
        <form action={onReject} className="flex-[2] flex gap-2 bg-rose-50 p-2 rounded border border-rose-100">
          <input type="hidden" name="approvalId" value={approvalId} />
          <input 
            type="text" 
            name="reason" 
            placeholder="Reason for rejection..." 
            required
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            disabled={isSubmitting}
            className="flex-1 text-xs p-1.5 rounded border border-rose-200 focus:outline-none focus:border-rose-400"
          />
          <button 
            type="submit"
            disabled={isSubmitting} 
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded whitespace-nowrap disabled:opacity-50"
          >
            Confirm
          </button>
          <button 
            type="button" 
            onClick={() => setShowRejectInput(false)}
            disabled={isSubmitting}
            className="px-2 py-1.5 bg-white text-slate-500 text-xs border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
        </form>
      )}
    </div>
  );
}
