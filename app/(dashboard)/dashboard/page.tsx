import { supabase } from '@/lib/supabase';
import { Users, FileText, CheckCircle, Clock, ArrowUpRight } from 'lucide-react';
import { SimulateWebhook } from '@/components/simulate-webhook';

export default async function DashboardPage() {
  // Fetch real data from the seeded DB
  const { count: totalLeads } = await supabase.from('students').select('*', { count: 'exact', head: true });
  const { count: pendingApprovals } = await supabase.from('approvals').select('*', { count: 'exact', head: true }).eq('status', 'pending');
  const { count: activitiesCount } = await supabase.from('activities').select('*', { count: 'exact', head: true });

  const { data: recentActivities } = await supabase
    .from('activities')
    .select('*, students(name)')
    .order('timestamp', { ascending: false })
    .limit(5);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard title="Total Leads" value={totalLeads || 0} icon={Users} color="bg-blue-50 text-blue-600" trend="+12% from last week" />
        <KPICard title="Pending Approvals" value={pendingApprovals || 0} icon={Clock} color="bg-amber-50 text-amber-600" trend="Requires attention" />
        <KPICard title="Total Activities" value={activitiesCount || 0} icon={FileText} color="bg-purple-50 text-purple-600" trend="+5 today" />
        <KPICard title="Success Rate" value="84%" icon={CheckCircle} color="bg-emerald-50 text-emerald-600" trend="+2% from last month" />
      </div>

      {/* Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Activity Panel */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800">Recent Activity</h3>
            <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              View All <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-4">
            {recentActivities?.map((activity: any) => (
              <div key={activity.id} className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-500">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-900">
                    <span className="font-bold">{activity.students?.name}</span> - {activity.action}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {activity.status}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions / AI Insights */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-sm p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <CheckCircle className="w-24 h-24" />
            </div>
            <h3 className="text-lg font-bold mb-2 relative z-10">AI Insights</h3>
            <p className="text-sm text-indigo-100 mb-4 relative z-10">
              You have 3 leads that require immediate follow-up based on Slack sentiment analysis.
            </p>
            <button className="relative z-10 w-full py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-sm font-medium transition-colors">
              Review Leads
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <SimulateWebhook />
              <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-50 text-sm font-medium text-slate-700 transition-colors border border-transparent hover:border-slate-200">
                Generate Partner Report
              </button>
              <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-50 text-sm font-medium text-slate-700 transition-colors border border-transparent hover:border-slate-200">
                Sync Slack Messages
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function KPICard({ title, value, icon: Icon, color, trend }: { title: string, value: string | number, icon: any, color: string, trend: string }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
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
