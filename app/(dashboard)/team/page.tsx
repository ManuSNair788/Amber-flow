import { supabase } from '@/lib/supabase';
import { addTeamMember, deleteTeamMember } from './actions';
import { Users, Trash2, Plus, ShieldAlert } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function TeamPage() {
  const { data: teamMembers } = await supabase
    .from('team_members')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Users className="w-6 h-6 text-indigo-600" />
          Team Management
        </h1>
        <p className="text-slate-500 mt-1">Manage KAMs and Admins for the POAI system.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50/50">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Add Team Member</h2>
          <form action={addTeamMember} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
              <input 
                name="name" 
                required 
                placeholder="Manu S Nair"
                className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Slack ID (Optional)</label>
              <input 
                name="slack_id" 
                placeholder="U083G34P8P3"
                className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
              <select 
                name="role" 
                className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              >
                <option value="KAM">KAM</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <button 
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg p-2 text-sm font-medium transition-colors flex items-center justify-center gap-2 h-[38px]"
            >
              <Plus className="w-4 h-4" />
              Add Member
            </button>
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Slack ID</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {teamMembers && teamMembers.length > 0 ? (
                teamMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 font-medium text-slate-900">{member.name}</td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">{member.slack_id || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        member.role === 'Admin' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {member.role === 'Admin' && <ShieldAlert className="w-3 h-3 mr-1" />}
                        {member.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <form action={async () => {
                        'use server';
                        await deleteTeamMember(member.id);
                      }}>
                        <button type="submit" className="text-slate-400 hover:text-rose-500 transition-colors p-1" title="Remove Member">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </form>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    No team members added yet. Add your first KAM above!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
