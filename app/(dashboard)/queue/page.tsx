import { supabase } from '@/lib/supabase';
import { Check } from 'lucide-react';
import { QueueItem } from '@/components/queue/queue-item';
import { handleApproveOnly, handleSendToWhatsApp, handleReject, handleCreateWaGroup, handleDnpQuickAction, handleEditMessage, handleGenerateDraft, handleReplyToSlackThread, handleIgnoreFollowup } from './actions';

export const dynamic = 'force-dynamic';

export default async function QueuePage() {
  const { data: approvals } = await supabase
    .from('approvals')
    .select(`
      *, 
      students(*, partners(*)),
      slack_threads (
        id, slack_channel_id, slack_thread_ts,
        approvals (
          id, raw_slack_context, message, status, is_followup, followup_number, created_at, approved_by
        )
      )
    `)
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
          const waGroupId = partner?.whatsapp_group_id || partner?.whatsapp_number || '';
          
          return (
            <QueueItem 
              key={approval.id} 
              approval={approval} 
              waGroupId={waGroupId}
              handleApproveOnly={handleApproveOnly}
              handleSendToWhatsApp={handleSendToWhatsApp}
              handleReject={handleReject}
              handleCreateWaGroup={handleCreateWaGroup}
              handleDnpQuickAction={handleDnpQuickAction}
              handleEditMessage={handleEditMessage}
              handleGenerateDraft={handleGenerateDraft}
              handleReplyToSlackThread={handleReplyToSlackThread}
              handleIgnoreFollowup={handleIgnoreFollowup}
            />
          );

        })}
        
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
