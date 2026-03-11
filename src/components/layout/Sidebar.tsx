import {
  CalendarCheck,
  Inbox,
  Target,
  Users,
  Settings,
  LayoutDashboard,
} from 'lucide-react'
import type { ViewType } from '../../types'

interface Props {
  activeView: ViewType
  onNavigate: (view: ViewType) => void
}

const navItems: { id: ViewType; label: string; icon: typeof CalendarCheck }[] = [
  { id: 'today', label: '今日重点', icon: CalendarCheck },
  { id: 'backlog', label: '待办清单', icon: Inbox },
  { id: 'annual', label: '年度目标', icon: Target },
  { id: 'team', label: '团队任务', icon: Users },
  { id: 'settings', label: '设置', icon: Settings },
]

export default function Sidebar({ activeView, onNavigate }: Props) {
  return (
    <aside className="w-60 bg-slate-900 text-white flex flex-col min-h-screen shrink-0">
      <div className="flex items-center gap-2 px-5 py-5 border-b border-slate-700">
        <LayoutDashboard className="w-6 h-6 text-primary-400" />
        <span className="text-lg font-bold tracking-tight">Dashboard</span>
      </div>

      <nav className="flex-1 py-4">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={`w-full flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors cursor-pointer ${
              activeView === id
                ? 'bg-primary-600/20 text-primary-300 border-r-2 border-primary-400'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Icon className="w-5 h-5" />
            {label}
          </button>
        ))}
      </nav>

      <div className="px-5 py-4 border-t border-slate-700 text-xs text-slate-500">
        数据存储在本地浏览器
      </div>
    </aside>
  )
}
