import {
  LayoutDashboard,
  Users,
  Settings,
} from 'lucide-react'
import type { ViewType } from '../../types'

interface Props {
  activeView: ViewType
  onNavigate: (view: ViewType) => void
}

const navItems: { id: ViewType; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: '概览', icon: LayoutDashboard },
  { id: 'team', label: '团队任务', icon: Users },
  { id: 'settings', label: '设置', icon: Settings },
]

export default function Sidebar({ activeView, onNavigate }: Props) {
  return (
    <aside className="w-44 bg-slate-900 text-white flex flex-col min-h-screen shrink-0">
      <div className="flex items-center gap-1.5 px-3 py-3 border-b border-slate-700">
        <LayoutDashboard className="w-4 h-4 text-primary-400" />
        <span className="text-sm font-bold tracking-tight">Dashboard</span>
      </div>

      <nav className="flex-1 py-2">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
              activeView === id
                ? 'bg-primary-600/20 text-primary-300 border-r-2 border-primary-400'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </nav>

      <div className="px-3 py-2 border-t border-slate-700 text-[10px] text-slate-500">
        数据存储在本地浏览器
      </div>
    </aside>
  )
}
