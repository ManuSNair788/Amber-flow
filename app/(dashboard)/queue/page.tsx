import { supabase } from '@/lib/supabase';
import { Check, X, Edit3, MessageSquareWarning, Slack, Phone } from 'lucide-react';
import { handleApprove, handleReject, handleCreateWaGroup } from './actions';

export default async function QueuePage() {
  const { data: approvals } = await supabase
    .from('approvals')
    .select('*, students(*, partners(*))')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Approval Queue</h1>
        <p className="text-slate-500 text-sm mt-1">Review Slack messages and approve them to be sent to the Partner's WhatsApp group.</p>
      </div>

      <div className="grid gap-4">
        {approvals?.map((approval: any) => {
          const partner = approval.students?.partners;
          const waNumber = partner?.whatsapp_number || 'No WA Mapping';
          
          return (
          <div key={approval.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col lg:flex-row gap-6">
            {/* Student Info */}
            <div className="lg:w-1/4 border-b lg:border-b-0 lg:border-r border-slate-200 pb-4 lg:pb-0 lg:pr-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                  {approval.students?.name?.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{approval.students?.name}</h3>
                  <p className="text-xs text-slate-500">{approval.students?.prospect_id}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-slate-600">
                <p><span className="font-medium text-slate-900">Partner:</span> {partner?.name}</p>
                <p><span className="font-medium text-slate-900">Status:</span> {approval.students?.status}</p>
                
                {/* Follow up Metric requested by user */}
                <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-amber-50 text-amber-700 rounded text-xs font-semibold mt-2 border border-amber-200">
                  <ClockIcon /> Follow-up #2
                </div>
              </div>

              {/* Create WA Group Action */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                <form action={handleCreateWaGroup}>
                  <input type="hidden" name="studentId" value={approval.students?.id} />
                  <button type="submit" className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] text-sm font-bold rounded-lg transition-colors border border-[#25D366]/20">
                    <Phone className="w-4 h-4" /> Create WA Group
                  </button>
                </form>
              </div>
            </div>

            {/* Message Content */}
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                 <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <MessageSquareWarning className="w-4 h-4 text-indigo-500" />
                  Extracted from Slack
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
                  <Slack className="w-3 h-3 text-[#E01E5A]" /> Partner message detected
                </div>
              </div>
              <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-700 text-sm whitespace-pre-wrap font-medium">
                {approval.message}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-row lg:flex-col gap-3 justify-center">
              <form action={handleApprove}>
                <input type="hidden" name="approvalId" value={approval.id} />
                <input type="hidden" name="waNumber" value={waNumber} />
                <button type="submit" className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-lg transition-colors shadow-sm whitespace-nowrap">
                  <Phone className="w-4 h-4" /> Approve & Send to WA
                </button>
              </form>
              <form action={handleReject}>
                <input type="hidden" name="approvalId" value={approval.id} />
                <button type="submit" className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-sm font-medium rounded-lg transition-colors">
                  <X className="w-4 h-4" /> Reject
                </button>
              </form>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 text-sm font-medium rounded-lg transition-colors">
                <Edit3 className="w-4 h-4" /> Edit
              </button>
            </div>
          </div>
        )})}
        
        {(!approvals || approvals.length === 0) && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <Check className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900">All caught up!</h3>
            <p className="text-slate-500">There are no messages waiting for your approval.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ClockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  )
}
