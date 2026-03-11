import type { TaskStatus, GoalStatus } from '../../types'

const taskConfig: Record<TaskStatus, { label: string; emoji: string; className: string }> = {
  todo: { label: '待办', emoji: '⏳', className: 'bg-slate-100 text-slate-600' },
  in_progress: { label: '进行中', emoji: '🔥', className: 'bg-amber-100 text-amber-600' },
  done: { label: '已完成', emoji: '✅', className: 'bg-emerald-100 text-emerald-600' },
}

const goalConfig: Record<GoalStatus, { label: string; emoji: string; className: string }> = {
  not_started: { label: '未开始', emoji: '⏳', className: 'bg-slate-100 text-slate-600' },
  in_progress: { label: '进行中', emoji: '🔥', className: 'bg-amber-100 text-amber-600' },
  completed: { label: '已完成', emoji: '🎉', className: 'bg-emerald-100 text-emerald-600' },
}

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const { label, emoji, className } = taskConfig[status]
  return <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${className}`}>{emoji} {label}</span>
}

export function GoalStatusBadge({ status }: { status: GoalStatus }) {
  const { label, emoji, className } = goalConfig[status]
  return <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${className}`}>{emoji} {label}</span>
}
