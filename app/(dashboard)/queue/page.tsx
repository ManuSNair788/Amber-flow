import { supabase } from '@/lib/supabase';
import { Check } from 'lucide-react';
import { QueueItem } from '@/components/queue/queue-item';
import { handleApproveOnly, handleSendToWhatsApp, handleReject, handleCreateWaGroup, handleDnpQuickAction, handleEditMessage, handleGenerateDraft, handleReplyToSlackThread, handleIgnoreFollowup } from './actions';

export const dynamic = 'force-dynamic';

export default async function QueuePage({ searchParams }: { searchParams: { kam?: string } }) {
  const selectedKam = searchParams?.kam || 'all';

  const { data: rawApprovals, error: approvalsError } = await supabase
    .from('approvals')
    .select(`
      *, 
      students(*, partners(*), team_members(*)),
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

  // Fetch counsellors separately
  const partnerIds = [...new Set(rawApprovals?.map(a => a.students?.partners?.id).filter(Boolean))];
  let allCounsellors: any[] = [];
  
  if (partnerIds.length > 0) {
    const { data: counsellorsData } = await supabase
      .from('counsellors')
      .select('*')
      .in('partner_id', partnerIds);
      
    allCounsellors = counsellorsData || [];
  }

  // Attach counsellors and filter by KAM
  let approvals = rawApprovals?.map(approval => {
    const partner = approval.students?.partners;
    if (partner) {
      partner.counsellors = allCounsellors.filter(c => c.partner_id === partner.id);
    }
    return approval;
  });

  if (selectedKam !== 'all' && selectedKam !== 'unassigned') {
    approvals = approvals?.filter(a => a.students?.team_members?.id === selectedKam);
  } else if (selectedKam === 'unassigned') {
    approvals = approvals?.filter(a => !a.students?.team_members);
  }

  // Fetch all team members for the dropdown filter
  const { data: teamMembers } = await supabase.from('team_members').select('*').order('name');

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Approval Queue</h1>
          <p className="text-slate-500 text-sm mt-1">Review Slack messages and approve them to be sent to the Partner's WhatsApp group.</p>
        </div>
        
        {/* KAM Filter */}
        <form className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm">
          <span className="text-sm font-medium text-slate-600">View Queue:</span>
          <select 
            name="kam"
            defaultValue={selectedKam}
            onChange={(e) => {
              const url = new URL(window.location.href);
              if (e.target.value === 'all') {
                url.searchParams.delete('kam');
              } else {
                url.searchParams.set('kam', e.target.value);
              }
              window.location.href = url.toString();
            }}
            className="text-sm border-none bg-slate-50 rounded px-2 py-1 focus:ring-0 outline-none text-slate-900 font-medium cursor-pointer"
          >
            <option value="all">All KAMs</option>
            <option value="unassigned">Unassigned</option>
            {teamMembers?.map(member => (
              <option key={member.id} value={member.id}>{member.name}</option>
            ))}
          </select>
        </form>
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
