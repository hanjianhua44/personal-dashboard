import type { TaskStatus, GoalStatus } from '../../types'

const taskConfig: Record<TaskStatus, { label: string; className: string }> = {
  todo: { label: '待办', className: 'bg-slate-100 text-slate-600' },
  in_progress: { label: '进行中', className: 'bg-blue-100 text-blue-700' },
  done: { label: '已完成', className: 'bg-green-100 text-green-700' },
}

const goalConfig: Record<GoalStatus, { label: string; className: string }> = {
  not_started: { label: '未开始', className: 'bg-slate-100 text-slate-600' },
  in_progress: { label: '进行中', className: 'bg-blue-100 text-blue-700' },
  completed: { label: '已完成', className: 'bg-green-100 text-green-700' },
}

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const { label, className } = taskConfig[status]
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${className}`}>{label}</span>
}

export function GoalStatusBadge({ status }: { status: GoalStatus }) {
  const { label, className } = goalConfig[status]
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${className}`}>{label}</span>
}
