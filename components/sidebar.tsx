import Link from 'next/link';
import { 
  Home, 
  ListChecks, 
  Users, 
  Building2, 
  BarChart2, 
  Clock, 
  Bot, 
  Settings,
  HelpCircle,
  MessageSquare,
  MessageCircle,
  Cpu,
  Database
} from 'lucide-react';

export function Sidebar() {
  return (
    <div className="w-64 bg-white border-r border-slate-200 h-full flex flex-col justify-between py-6">
      <div>
        <div className="px-6 mb-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <Bot className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-lg leading-tight">POAI</h1>
            <p className="text-[10px] text-slate-500 font-medium">Partnership Operations<br/>AI Assistant</p>
          </div>
        </div>

        <nav className="space-y-1 px-3">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 bg-indigo-50 text-indigo-700 rounded-lg font-medium transition-colors">
            <Home className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>
          
          <Link href="/queue" className="flex items-center justify-between px-3 py-2.5 text-slate-600 hover:bg-slate-50 rounded-lg font-medium transition-colors">
            <div className="flex items-center gap-3">
              <ListChecks className="w-5 h-5" />
              <span>Approval Queue</span>
            </div>
            <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">8</span>
          </Link>

          <Link href="/leads" className="flex items-center justify-between px-3 py-2.5 text-slate-600 hover:bg-slate-50 rounded-lg font-medium transition-colors">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5" />
              <span>Leads</span>
            </div>
          </Link>

          <Link href="/partners" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 rounded-lg font-medium transition-colors">
            <Building2 className="w-5 h-5" />
            <span>Partners</span>
          </Link>

          <Link href="/reports" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 rounded-lg font-medium transition-colors">
            <BarChart2 className="w-5 h-5" />
            <span>Reports</span>
          </Link>

          <Link href="/activity" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 rounded-lg font-medium transition-colors">
            <Clock className="w-5 h-5" />
            <span>Activity Log</span>
          </Link>

          <Link href="/ai-chat" className="flex items-center justify-between px-3 py-2.5 text-slate-600 hover:bg-slate-50 rounded-lg font-medium transition-colors">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5" />
              <span>AI Chat</span>
            </div>
            <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full">Beta</span>
          </Link>

          <Link href="/settings" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 rounded-lg font-medium transition-colors">
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </Link>
        </nav>
      </div>

      <div className="px-6 space-y-6">
        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Connections</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <MessageSquare className="w-4 h-4 text-[#E01E5A]" /> Slack
              </div>
              <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-medium">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Connected
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <MessageCircle className="w-4 h-4 text-[#25D366]" /> WhatsApp
              </div>
              <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-medium">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Connected
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <Cpu className="w-4 h-4 text-slate-800" /> OpenAI
              </div>
              <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-medium">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Connected
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <Database className="w-4 h-4 text-slate-500" /> Database
              </div>
              <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-medium">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Connected
              </div>
            </div>
          </div>
        </div>

        <button className="flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors">
          <HelpCircle className="w-4 h-4" /> Need Help?
        </button>
      </div>
    </div>
  );
}
