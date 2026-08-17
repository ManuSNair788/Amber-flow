import { supabase } from '@/lib/supabase';
import { Check } from 'lucide-react';
import { QueueItem } from '@/components/queue/queue-item';
import { handleApproveOnly, handleSendToWhatsApp, handleReject, handleCreateWaGroup, handleDnpQuickAction, handleEditMessage, handleGenerateDraft, handleReplyToSlackThread, handleIgnoreFollowup } from './actions';

export const dynamic = 'force-dynamic';

export default async function QueuePage() {
  const { data: rawApprovals, error: approvalsError } = await supabase
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

  if (approvalsError) {
    console.error("Error fetching approvals:", approvalsError);
  }

  // Fetch counsellors separately to bypass PostgREST schema cache issues with the newly created table
  const partnerIds = [...new Set(rawApprovals?.map(a => a.students?.partners?.id).filter(Boolean))];
  let allCounsellors: any[] = [];
  
  if (partnerIds.length > 0) {
    const { data: counsellorsData } = await supabase
      .from('counsellors')
      .select('*')
      .in('partner_id', partnerIds);
      
    allCounsellors = counsellorsData || [];
  }

  // Attach counsellors to partners manually
  const approvals = rawApprovals?.map(approval => {
    const partner = approval.students?.partners;
    if (partner) {
      partner.counsellors = allCounsellors.filter(c => c.partner_id === partner.id);
    }
    return approval;
  });

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
