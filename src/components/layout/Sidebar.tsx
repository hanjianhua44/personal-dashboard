import {
  LayoutDashboard,
  Target,
  Lightbulb,
  Users,
  Settings,
} from 'lucide-react'
import type { ViewType } from '../../types'

interface Props {
  activeView: ViewType
  onNavigate: (view: ViewType) => void
}

const navItems: { id: ViewType; label: string; icon: typeof LayoutDashboard; emoji: string; activeColor: string }[] = [
  { id: 'overview', label: '概览', icon: LayoutDashboard, emoji: '🏠', activeColor: 'from-indigo-500 to-purple-500' },
  { id: 'annual', label: '年度目标', icon: Target, emoji: '🎯', activeColor: 'from-amber-500 to-orange-500' },
  { id: 'ideas', label: '灵感记录', icon: Lightbulb, emoji: '💡', activeColor: 'from-violet-500 to-pink-500' },
  { id: 'team', label: '团队任务', icon: Users, emoji: '👥', activeColor: 'from-cyan-500 to-teal-500' },
  { id: 'settings', label: '设置', icon: Settings, emoji: '⚙️', activeColor: 'from-slate-500 to-slate-600' },
]

export default function Sidebar({ activeView, onNavigate }: Props) {
  return (
    <aside className="w-48 bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col min-h-screen shrink-0">
      <div className="flex items-center gap-2 px-4 py-4 border-b border-white/10">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <span className="text-sm">🚀</span>
        </div>
        <span className="text-sm font-bold tracking-tight bg-gradient-to-r from-indigo-200 to-purple-200 bg-clip-text text-transparent">
          Dashboard
        </span>
      </div>

      <nav className="flex-1 py-3 px-2 space-y-1">
        {navItems.map(({ id, label, emoji, activeColor }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${
              activeView === id
                ? `bg-gradient-to-r ${activeColor} text-white shadow-lg shadow-indigo-500/20`
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <span className="text-base">{emoji}</span>
            {label}
          </button>
        ))}
      </nav>

      <div className="px-4 py-3 border-t border-white/10">
        <div className="flex items-center gap-2 text-[10px] text-slate-500">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          数据安全存储在本地
        </div>
      </div>
    </aside>
  )
}
