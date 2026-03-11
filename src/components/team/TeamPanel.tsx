import { useState } from 'react'
import { Plus, Trash2, UserPlus } from 'lucide-react'
import type { TeamMember, TeamTask, TaskStatus, Priority } from '../../types'
import PriorityBadge from '../ui/PriorityBadge'
import { generateId, getNextMemberColor } from '../../utils/helpers'

interface Props {
  members: TeamMember[]
  tasks: TeamTask[]
  onAddMember: (member: TeamMember) => void
  onUpdateMember: (id: string, patch: Partial<TeamMember>) => void
  onDeleteMember: (id: string) => void
  onAddTask: (task: TeamTask) => void
  onUpdateTask: (id: string, patch: Partial<TeamTask>) => void
  onDeleteTask: (id: string) => void
}

const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: 'todo', label: '待办' },
  { value: 'in_progress', label: '进行中' },
  { value: 'done', label: '已完成' },
]

export default function TeamPanel({
  members, tasks,
  onAddMember, onDeleteMember,
  onAddTask, onUpdateTask, onDeleteTask,
}: Props) {
  const [showAddMember, setShowAddMember] = useState(false)
  const [memberName, setMemberName] = useState('')
  const [showAddTask, setShowAddTask] = useState(false)
  const [taskTitle, setTaskTitle] = useState('')
  const [taskAssignee, setTaskAssignee] = useState('')
  const [taskPriority, setTaskPriority] = useState<Priority>('medium')
  const [selectedMember, setSelectedMember] = useState<string | null>(null)

  const filteredTasks = selectedMember
    ? tasks.filter(t => t.assigneeId === selectedMember)
    : tasks

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const statusOrder: Record<TaskStatus, number> = { todo: 0, in_progress: 1, done: 2 }
    if (statusOrder[a.status] !== statusOrder[b.status]) return statusOrder[a.status] - statusOrder[b.status]
    const pOrder: Record<Priority, number> = { high: 0, medium: 1, low: 2 }
    return pOrder[a.priority] - pOrder[b.priority]
  })

  function handleAddMember() {
    if (!memberName.trim()) return
    const name = memberName.trim()
    onAddMember({
      id: generateId(),
      name,
      avatar: name.slice(0, 1),
      color: getNextMemberColor(members.length),
    })
    setMemberName('')
    setShowAddMember(false)
  }

  function handleAddTask() {
    if (!taskTitle.trim() || !taskAssignee) return
    onAddTask({
      id: generateId(),
      title: taskTitle.trim(),
      assigneeId: taskAssignee,
      status: 'todo',
      priority: taskPriority,
      createdAt: new Date().toISOString(),
    })
    setTaskTitle('')
    setTaskPriority('medium')
    setShowAddTask(false)
  }

  function getMember(id: string) {
    return members.find(m => m.id === id)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">团队任务</h1>
          <p className="text-sm text-slate-500 mt-1">
            {members.length} 位成员 / {tasks.filter(t => t.status !== 'done').length} 项进行中
          </p>
        </div>
      </div>

      {/* Members bar */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setSelectedMember(null)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            !selectedMember ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          全部
        </button>
        {members.map(m => (
          <button
            key={m.id}
            onClick={() => setSelectedMember(selectedMember === m.id ? null : m.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedMember === m.id ? 'text-white' : 'text-slate-600 hover:opacity-80'
            }`}
            style={{
              backgroundColor: selectedMember === m.id ? m.color : `${m.color}20`,
            }}
          >
            <span
              className="w-5 h-5 rounded-full flex items-center justify-center text-xs text-white font-bold shrink-0"
              style={{ backgroundColor: m.color }}
            >
              {m.avatar}
            </span>
            {m.name}
            <button
              onClick={e => { e.stopPropagation(); onDeleteMember(m.id) }}
              className="ml-1 opacity-0 group-hover:opacity-100 hover:text-red-500"
              title="删除成员"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </button>
        ))}
        {showAddMember ? (
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={memberName}
              onChange={e => setMemberName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddMember()}
              placeholder="姓名"
              autoFocus
              className="w-24 px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
            <button onClick={handleAddMember} className="px-2 py-1.5 rounded-lg bg-primary-500 text-white text-sm">
              添加
            </button>
            <button onClick={() => { setShowAddMember(false); setMemberName('') }} className="px-2 py-1.5 text-sm text-slate-400">
              取消
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowAddMember(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm text-slate-400 border border-dashed border-slate-300 hover:border-primary-300 hover:text-primary-500 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            添加成员
          </button>
        )}
      </div>

      {/* Tasks list */}
      <div className="space-y-2">
        {sortedTasks.map(task => {
          const member = getMember(task.assigneeId)
          return (
            <div
              key={task.id}
              className={`group flex items-center gap-3 p-3 rounded-xl border transition-all ${
                task.status === 'done'
                  ? 'bg-slate-50 border-slate-100'
                  : 'bg-white border-slate-200 shadow-sm hover:shadow'
              }`}
            >
              {member && (
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs text-white font-bold shrink-0"
                  style={{ backgroundColor: member.color }}
                  title={member.name}
                >
                  {member.avatar}
                </span>
              )}
              <div className="flex-1 min-w-0">
                <span className={`text-sm ${task.status === 'done' ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                  {task.title}
                </span>
                {member && (
                  <span className="ml-2 text-xs text-slate-400">{member.name}</span>
                )}
              </div>
              <PriorityBadge priority={task.priority} />
              <select
                value={task.status}
                onChange={e => onUpdateTask(task.id, { status: e.target.value as TaskStatus })}
                className="text-xs border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-400"
              >
                {statusOptions.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <button
                onClick={() => onDeleteTask(task.id)}
                className="hidden group-hover:block p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )
        })}
      </div>

      {sortedTasks.length === 0 && !showAddTask && (
        <div className="text-center py-12 text-slate-400">
          <p className="text-lg mb-1">{members.length === 0 ? '先添加团队成员' : '暂无任务'}</p>
          <p className="text-sm">{members.length === 0 ? '点击上方「添加成员」开始' : '点击下方按钮分配任务'}</p>
        </div>
      )}

      {members.length > 0 && (
        showAddTask ? (
          <div className="mt-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
            <input
              type="text"
              value={taskTitle}
              onChange={e => setTaskTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddTask()}
              placeholder="任务内容..."
              autoFocus
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
            />
            <div className="flex items-center gap-3 mt-3">
              <select
                value={taskAssignee}
                onChange={e => setTaskAssignee(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              >
                <option value="">选择负责人</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
              <div className="flex gap-1">
                {(['high', 'medium', 'low'] as Priority[]).map(p => (
                  <button
                    key={p}
                    onClick={() => setTaskPriority(p)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      taskPriority === p ? 'bg-primary-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {p === 'high' ? '高' : p === 'medium' ? '中' : '低'}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={() => { setShowAddTask(false); setTaskTitle(''); setTaskAssignee('') }}
                className="px-3 py-1.5 rounded-lg text-sm text-slate-500 hover:bg-slate-100 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAddTask}
                className="px-4 py-1.5 rounded-lg text-sm bg-primary-500 text-white hover:bg-primary-600 transition-colors"
              >
                添加
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddTask(true)}
            className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-primary-300 hover:text-primary-500 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span className="text-sm font-medium">分配任务</span>
          </button>
        )
      )}
    </div>
  )
}
