import { supabase } from '@/lib/supabase';
import { UserCircle2, Clock, Mail, Phone, Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ThreadActions } from '@/components/leads/thread-actions';

export default async function Student360Page({ params }: { params: { id: string } }) {
  const { data: student } = await supabase
    .from('students')
    .select('*, partners(name)')
    .eq('id', params.id)
    .single();

  const { data: activities } = await supabase
    .from('activities')
    .select('*')
    .eq('student_id', params.id)
    .order('timestamp', { ascending: false });

  const { data: threads } = await supabase
    .from('slack_threads')
    .select(`
      id, slack_channel_id, slack_thread_ts, status, followup_count, created_at,
      approvals (
        id, raw_slack_context, message, status, rejection_reason, is_followup, followup_number, created_at
      )
    `)
    .eq('student_id', params.id)
    .order('created_at', { ascending: false });

  if (!student) {
    return <div>Student not found.</div>;
  }

  return (
    <div className="space-y-6">
      <Link href="/leads" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 transition-colors font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to Leads
      </Link>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Profile Card */}
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex flex-col items-center text-center pb-6 border-b border-slate-100">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-600 font-bold text-3xl mb-4 shadow-inner">
                {student.name.charAt(0)}
              </div>
              <h2 className="text-xl font-bold text-slate-900">{student.name}</h2>
              <p className="text-slate-500 text-sm mt-1 flex items-center gap-1 justify-center">
                ID: <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">{student.prospect_id}</span>
              </p>
              <span className="mt-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700">
                {student.status}
              </span>
            </div>
            
            <div className="py-6 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-2"><UserCircle2 className="w-4 h-4"/> Partner</span>
                <span className="font-semibold text-slate-900">{student.partners?.name || 'None'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-2"><Mail className="w-4 h-4"/> Email</span>
                <span className="font-semibold text-slate-900">Not provided</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-2"><Phone className="w-4 h-4"/> Phone</span>
                <span className="font-semibold text-slate-900">Not provided</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-2"><Calendar className="w-4 h-4"/> Added On</span>
                <span className="font-semibold text-slate-900">{new Date(student.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6">
            <h3 className="font-bold text-amber-800 mb-2">Important Notes</h3>
            <p className="text-amber-700 text-sm leading-relaxed">{student.notes || "No notes available for this lead."}</p>
          </div>
        </div>

        {/* Right Column: Timeline & Activity */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Slack Threads */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="border-b border-slate-200 pb-4 mb-6">
              <h3 className="text-lg font-bold text-slate-800">Slack Threads</h3>
              <p className="text-sm text-slate-500 mt-1">Full conversation history synced from Slack</p>
            </div>
            
            <div className="space-y-8">
              {threads?.map((thread: any) => {
                // Sort approvals by created_at
                const sortedApprovals = [...(thread.approvals || [])].sort((a: any, b: any) => 
                  new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                );
                
                return (
                  <div key={thread.id} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-slate-50 border-b border-slate-200 p-3 px-4 flex items-center justify-between">
                      <div className="font-semibold text-sm text-slate-700 flex items-center gap-2">
                        Slack Thread
                        <span className="text-xs font-normal text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                          ts: {thread.slack_thread_ts}
                        </span>
                      </div>
                      <span className="text-xs font-bold px-2 py-1 bg-white border border-slate-200 rounded-md text-slate-600">
                        {thread.followup_count} Follow-ups
                      </span>
                    </div>
                    
                    <div className="p-4 space-y-4 bg-white">
                      {sortedApprovals.map((app: any, idx: number) => (
                        <div key={app.id} className="relative pl-4 border-l-2 border-indigo-100 pb-2 last:pb-0">
                          <div className="absolute w-2 h-2 bg-indigo-500 rounded-full -left-[5px] top-1.5 ring-4 ring-white" />
                          
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-bold text-slate-800">
                              {app.is_followup ? `Followup #${app.followup_number}` : 'Initial Message'}
                            </span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider
                              ${app.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 
                                app.status === 'rejected' ? 'bg-rose-100 text-rose-700' : 
                                'bg-amber-100 text-amber-700'}`}
                            >
                              {app.status}
                            </span>
                          </div>
                          
                          {app.raw_slack_context && (
                            <div className="text-sm text-slate-600 bg-slate-50 p-2 rounded mb-2 border border-slate-100 whitespace-pre-wrap">
                              <div className="text-xs font-bold text-slate-400 mb-1">Incoming context</div>
                              {app.raw_slack_context.split('SLACK_URL:')[0].trim()}
                            </div>
                          )}
                          
                          {app.status === 'rejected' && app.rejection_reason && (
                            <div className="text-sm text-rose-700 bg-rose-50 p-2 rounded mb-2 border border-rose-100">
                              <span className="font-bold">Rejection Reason:</span> {app.rejection_reason}
                            </div>
                          )}

                          {app.status === 'approved' && app.message && (
                            <div className="text-sm text-emerald-700 bg-emerald-50 p-2 rounded mb-2 border border-emerald-100">
                              <span className="font-bold">Sent to WhatsApp:</span> {app.message}
                            </div>
                          )}

                          {app.status === 'pending' && (
                            <ThreadActions approvalId={app.id} />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              
              {(!threads || threads.length === 0) && (
                <p className="text-sm text-slate-500">No Slack threads linked to this lead.</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="border-b border-slate-200 pb-4 mb-6">
              <h3 className="text-lg font-bold text-slate-800">Activity Timeline</h3>
          </div>
          
          <div className="relative pl-6 space-y-8 before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
            {activities?.map((activity: any) => (
              <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                {/* Timeline dot */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-indigo-100 text-indigo-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute left-[-44px] md:left-1/2 md:-ml-5">
                  <Clock className="w-4 h-4" />
                </div>
                {/* Content */}
                <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 text-sm">{activity.action}</span>
                    <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{activity.status}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">{new Date(activity.timestamp).toLocaleString()}</p>
                </div>
              </div>
            ))}
            {(!activities || activities.length === 0) && (
              <p className="text-sm text-slate-500 pl-4 relative z-10">No activity logged for this student yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
