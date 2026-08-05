import { supabase } from '@/lib/supabase';
import { Activity, Clock, Search, Filter } from 'lucide-react';

export default async function ActivityLogPage() {
  const { data: activities } = await supabase
    .from('activities')
    .select('*, students(name, prospect_id)')
    .order('timestamp', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Global Activity Log</h1>
          <p className="text-slate-500 text-sm mt-1">Audit trail of all automated and manual actions across the platform.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-4 bg-slate-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search logs by student or action..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
            />
          </div>
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>

        {/* Log List */}
        <div className="divide-y divide-slate-100">
          {activities?.map((activity: any) => (
            <div key={activity.id} className="p-4 sm:px-6 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0 border border-indigo-100 text-indigo-500">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {activity.action}
                  </p>
                  <p className="text-sm text-slate-500 mt-0.5">
                    For student: <span className="font-semibold text-slate-700">{activity.students?.name || 'Unknown'}</span> 
                    <span className="mx-2 text-slate-300">•</span> 
                    ID: {activity.students?.prospect_id || 'N/A'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm whitespace-nowrap">
                {activity.status && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                    {activity.status}
                  </span>
                )}
                <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                  <Clock className="w-4 h-4" />
                  {new Date(activity.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
          
          {(!activities || activities.length === 0) && (
            <div className="p-12 text-center text-slate-500">
              <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-base font-medium text-slate-700">No activity found</p>
              <p className="text-sm mt-1">Actions taken on the platform will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
