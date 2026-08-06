import { supabase } from '@/lib/supabase';
import { Users, ListChecks, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { SimulateWebhook } from '@/components/simulate-webhook';
import { draftDnpFollowUp } from './actions';

export const dynamic = 'force-dynamic'

export default async function DashboardPage({ searchParams }: { searchParams: { filter?: string } }) {
  const filter = searchParams.filter || 'week';
  
  // Basic date math for MVP
  const now = new Date();
  let startDate = new Date();
  if (filter === 'today') startDate.setHours(0,0,0,0);
  if (filter === 'week') startDate.setDate(now.getDate() - 7);
  if (filter === 'month') startDate.setMonth(now.getMonth() - 1);
  if (filter === 'year') startDate.setFullYear(now.getFullYear() - 1);

  const isoStart = startDate.toISOString();

  // Fetch data filtered by time
  const { count: taggedLeads } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', isoStart);
    
  const { count: pendingApprovals } = await supabase
    .from('approvals')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending'); // Usually approvals are current state, not just time-filtered, but could be filtered

  const { data: recentLeads } = await supabase
    .from('students')
    .select('*, partners(name)')
    .gte('created_at', isoStart)
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Overview of leads you've been tagged in.</p>
        </div>
        
        <div className="flex bg-white rounded-lg p-1 shadow-sm border border-slate-200">
          {['today', 'week', 'month', 'year'].map((f) => (
            <Link 
              key={f} 
              href={`/dashboard?filter=${f}`}
              className={`px-4 py-1.5 text-sm font-medium rounded-md capitalize transition-colors ${filter === f ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
            >
              {f}
            </Link>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard 
          title="Tagged Leads" 
          value={taggedLeads || 0} 
          icon={Users} 
          color="bg-indigo-50 text-indigo-600" 
          trend={`In the last ${filter}`} 
        />
        <KPICard 
          title="Pending Actions" 
          value={pendingApprovals || 0} 
          icon={ListChecks} 
          color="bg-amber-50 text-amber-600" 
          trend="Requires attention" 
        />
        <KPICard 
          title="Avg Response" 
          value="2.4h" 
          icon={Clock} 
          color="bg-emerald-50 text-emerald-600" 
          trend="Looking good" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Recent Tagged Leads ({filter})</h3>
          
          <div className="space-y-4">
            {recentLeads?.map((lead: any) => (
              <div key={lead.id} className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors">
                <div>
                  <p className="font-bold text-slate-900">{lead.name}</p>
                  <p className="text-sm text-slate-500 flex items-center gap-2">
                    <span>{lead.partners?.name}</span> • 
                    <span className="text-xs">{new Date(lead.created_at).toLocaleDateString()}</span>
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  {lead.status === 'DNP' && (
                    <form action={draftDnpFollowUp}>
                      <input type="hidden" name="studentId" value={lead.id} />
                      <input type="hidden" name="studentName" value={lead.name} />
                      <input type="hidden" name="partnerName" value={lead.partners?.name} />
                      <button type="submit" className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-md transition-colors border border-rose-200">
                        Draft DNP Follow-up
                      </button>
                    </form>
                  )}
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${lead.status === 'DNP' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'}`}>
                    {lead.status}
                  </span>
                </div>
              </div>
            ))}
            
            {(!recentLeads || recentLeads.length === 0) && (
              <p className="text-center text-slate-500 py-8">No leads found for this time period.</p>
            )}
          </div>
        </div>
        
        <div>
           <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <SimulateWebhook />
              <Link href="/queue" className="block w-full text-center px-4 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-sm font-medium text-white transition-colors">
                View Approval Queue
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, icon: Icon, color, trend }: { title: string, value: string | number, icon: any, color: string, trend: string }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500">{title}</p>
          <h3 className="text-3xl font-bold text-slate-900 mt-2">{value}</h3>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <p className="text-xs font-medium text-slate-400 mt-4">{trend}</p>
    </div>
  );
}
