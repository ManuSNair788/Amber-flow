import { supabase } from '@/lib/supabase';
import { Check, X, Edit3, MessageSquareWarning } from 'lucide-react';
import { handleApprove, handleReject } from './actions';

export default async function QueuePage() {
  const { data: approvals } = await supabase
    .from('approvals')
    .select('*, students(*, partners(name))')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Approval Queue</h1>
        <p className="text-slate-500 text-sm mt-1">Review and approve AI-generated follow-up messages before they are sent.</p>
      </div>

      <div className="grid gap-4">
        {approvals?.map((approval: any) => (
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
                <p><span className="font-medium text-slate-900">Partner:</span> {approval.students?.partners?.name}</p>
                <p><span className="font-medium text-slate-900">Status:</span> {approval.students?.status}</p>
              </div>
            </div>

            {/* Message Content */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-slate-700">
                <MessageSquareWarning className="w-4 h-4 text-indigo-500" />
                AI Generated Draft
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-700 text-sm whitespace-pre-wrap font-medium">
                {approval.message}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-row lg:flex-col gap-3 justify-center">
              <form action={handleApprove}>
                <input type="hidden" name="approvalId" value={approval.id} />
                <button type="submit" className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
                  <Check className="w-4 h-4" /> Approve
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
        ))}
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
