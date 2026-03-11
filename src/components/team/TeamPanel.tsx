import { useState } from 'react'
import {
  Plus, Trash2, UserPlus, ChevronDown, ChevronRight,
  CheckCircle2, Circle, StickyNote,
} from 'lucide-react'
import type { TeamMember, TeamTask, TaskStatus, Priority, SubTask } from '../../types'
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
  const [expandedTask, setExpandedTask] = useState<string | null>(null)
  const [newSubtask, setNewSubtask] = useState('')
  const [editingNote, setEditingNote] = useState<string | null>(null)
  const [noteText, setNoteText] = useState('')

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
      subtasks: [],
      note: '',
      createdAt: new Date().toISOString(),
    })
    setTaskTitle('')
    setTaskPriority('medium')
    setShowAddTask(false)
  }

  function getMember(id: string) {
    return members.find(m => m.id === id)
  }

  function addSubtask(taskId: string) {
    if (!newSubtask.trim()) return
    const task = tasks.find(t => t.id === taskId)
    if (!task) return
    const st: SubTask = { id: generateId(), title: newSubtask.trim(), completed: false }
    onUpdateTask(taskId, { subtasks: [...(task.subtasks || []), st] })
    setNewSubtask('')
  }

  function toggleSubtask(taskId: string, stId: string) {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return
    const updated = (task.subtasks || []).map(s => s.id === stId ? { ...s, completed: !s.completed } : s)
    onUpdateTask(taskId, { subtasks: updated })
  }

  function deleteSubtask(taskId: string, stId: string) {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return
    onUpdateTask(taskId, { subtasks: (task.subtasks || []).filter(s => s.id !== stId) })
  }

  function startEditNote(task: TeamTask) {
    setEditingNote(task.id)
    setNoteText(task.note || '')
  }

  function saveNote(taskId: string) {
    onUpdateTask(taskId, { note: noteText })
    setEditingNote(null)
    setNoteText('')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-sm font-bold text-slate-800">团队任务</h1>
          <p className="text-[10px] text-slate-500">
            {members.length} 位成员 / {tasks.filter(t => t.status !== 'done').length} 项进行中
          </p>
        </div>
      </div>

      {/* Members bar */}
      <div className="flex items-center gap-1 mb-3 flex-wrap">
        <button
          onClick={() => setSelectedMember(null)}
          className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
            !selectedMember ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          全部
        </button>
        {members.map(m => (
          <button
            key={m.id}
            onClick={() => setSelectedMember(selectedMember === m.id ? null : m.id)}
            className={`group flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
              selectedMember === m.id ? 'text-white' : 'text-slate-600 hover:opacity-80'
            }`}
            style={{
              backgroundColor: selectedMember === m.id ? m.color : `${m.color}20`,
            }}
          >
            <span
              className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] text-white font-bold shrink-0"
              style={{ backgroundColor: m.color }}
            >
              {m.avatar}
            </span>
            {m.name}
            <span
              onClick={e => { e.stopPropagation(); onDeleteMember(m.id) }}
              className="ml-0.5 hidden group-hover:inline text-current opacity-50 hover:opacity-100 cursor-pointer"
              title="删除成员"
            >
              <Trash2 className="w-3 h-3" />
            </span>
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
              className="w-20 px-2 py-1 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
            <button onClick={handleAddMember} className="px-2 py-1 rounded-lg bg-primary-500 text-white text-xs">
              添加
            </button>
            <button onClick={() => { setShowAddMember(false); setMemberName('') }} className="px-1.5 py-1 text-xs text-slate-400">
              取消
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowAddMember(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs text-slate-400 border border-dashed border-slate-300 hover:border-primary-300 hover:text-primary-500 transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            添加成员
          </button>
        )}
      </div>

      {/* Tasks list */}
      <div className="space-y-2">
        {sortedTasks.map(task => {
          const member = getMember(task.assigneeId)
          const isExpanded = expandedTask === task.id
          const subtasks = task.subtasks || []
          const doneCount = subtasks.filter(s => s.completed).length
          const hasDetail = subtasks.length > 0 || task.note

          return (
            <div
              key={task.id}
              className={`rounded-xl border transition-all overflow-hidden ${
                task.status === 'done'
                  ? 'bg-slate-50 border-slate-100'
                  : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              {/* Header row */}
              <div className="group flex items-center gap-2 p-2.5">
                <button
                  onClick={() => setExpandedTask(isExpanded ? null : task.id)}
                  className="shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {isExpanded
                    ? <ChevronDown className="w-4 h-4" />
                    : <ChevronRight className="w-4 h-4" />
                  }
                </button>
                {member && (
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] text-white font-bold shrink-0"
                    style={{ backgroundColor: member.color }}
                    title={member.name}
                  >
                    {member.avatar}
                  </span>
                )}
                <div className="flex-1 min-w-0">
                  <span className={`text-xs ${task.status === 'done' ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                    {task.title}
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {member && <span className="text-[10px] text-slate-400">{member.name}</span>}
                    {subtasks.length > 0 && (
                      <span className="text-[10px] text-slate-400">
                        {doneCount}/{subtasks.length} 子任务
                      </span>
                    )}
                    {hasDetail && <StickyNote className="w-3 h-3 text-slate-300" />}
                  </div>
                </div>
                {subtasks.length > 0 && (
                  <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden shrink-0">
                    <div
                      className="h-full bg-primary-400 rounded-full transition-all duration-300"
                      style={{ width: `${subtasks.length > 0 ? (doneCount / subtasks.length) * 100 : 0}%` }}
                    />
                  </div>
                )}
                <PriorityBadge priority={task.priority} />
                <select
                  value={task.status}
                  onChange={e => onUpdateTask(task.id, { status: e.target.value as TaskStatus })}
                  onClick={e => e.stopPropagation()}
                  className="text-[10px] border border-slate-200 rounded-lg px-1.5 py-0.5 focus:outline-none focus:ring-2 focus:ring-primary-400"
                >
                  {statusOptions.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <button
                  onClick={() => onDeleteTask(task.id)}
                  className="hidden group-hover:block p-1 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="px-4 pb-3 pt-0 border-t border-slate-100">
                  {/* Subtasks */}
                  <p className="text-[10px] text-slate-400 font-semibold mt-2.5 mb-1.5 uppercase tracking-wider">子任务</p>
                  <div className="space-y-1">
                    {subtasks.map(st => (
                      <div key={st.id} className="group/st flex items-center gap-2 py-0.5">
                        <button onClick={() => toggleSubtask(task.id, st.id)} className="shrink-0">
                          {st.completed
                            ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                            : <Circle className="w-3.5 h-3.5 text-slate-300" />
                          }
                        </button>
                        <span className={`text-xs flex-1 ${st.completed ? 'line-through text-slate-400' : 'text-slate-600'}`}>
                          {st.title}
                        </span>
                        <button
                          onClick={() => deleteSubtask(task.id, st.id)}
                          className="hidden group-hover/st:block p-0.5 rounded hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-1.5 mt-1.5">
                    <input
                      type="text"
                      value={expandedTask === task.id ? newSubtask : ''}
                      onChange={e => setNewSubtask(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addSubtask(task.id)}
                      placeholder="添加子任务..."
                      className="flex-1 px-2 py-1 rounded border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                    />
                    <button
                      onClick={() => addSubtask(task.id)}
                      className="px-2 py-1 rounded text-xs bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                    >
                      添加
                    </button>
                  </div>

                  {/* Note */}
                  <p className="text-[10px] text-slate-400 font-semibold mt-3 mb-1.5 uppercase tracking-wider">备注</p>
                  {editingNote === task.id ? (
                    <div>
                      <textarea
                        value={noteText}
                        onChange={e => setNoteText(e.target.value)}
                        rows={3}
                        autoFocus
                        className="w-full px-2 py-1.5 rounded border border-slate-200 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent resize-none"
                        placeholder="记录进展、问题、备忘..."
                      />
                      <div className="flex justify-end gap-1.5 mt-1">
                        <button
                          onClick={() => setEditingNote(null)}
                          className="px-2 py-0.5 text-xs text-slate-400 hover:text-slate-600"
                        >
                          取消
                        </button>
                        <button
                          onClick={() => saveNote(task.id)}
                          className="px-2 py-0.5 rounded text-xs bg-primary-500 text-white hover:bg-primary-600"
                        >
                          保存
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => startEditNote(task)}
                      className="px-2 py-1.5 rounded bg-slate-50 text-xs text-slate-500 cursor-pointer hover:bg-slate-100 transition-colors min-h-[2rem] whitespace-pre-wrap"
                    >
                      {task.note || <span className="text-slate-300 italic">点击添加备注...</span>}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {sortedTasks.length === 0 && !showAddTask && (
        <div className="text-center py-8 text-slate-400">
          <p className="text-xs mb-0.5">{members.length === 0 ? '先添加团队成员' : '暂无任务'}</p>
          <p className="text-xs">{members.length === 0 ? '点击上方「添加成员」开始' : '点击下方按钮分配任务'}</p>
        </div>
      )}

      {members.length > 0 && (
        showAddTask ? (
          <div className="mt-3 p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
            <input
              type="text"
              value={taskTitle}
              onChange={e => setTaskTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddTask()}
              placeholder="任务内容..."
              autoFocus
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
            />
            <div className="flex items-center gap-2 mt-2">
              <select
                value={taskAssignee}
                onChange={e => setTaskAssignee(e.target.value)}
                className="flex-1 px-2 py-1 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary-400"
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
                    className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                      taskPriority === p ? 'bg-primary-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {p === 'high' ? '高' : p === 'medium' ? '中' : '低'}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-1.5 mt-2">
              <button
                onClick={() => { setShowAddTask(false); setTaskTitle(''); setTaskAssignee('') }}
                className="px-2 py-1 rounded-lg text-xs text-slate-500 hover:bg-slate-100 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAddTask}
                className="px-3 py-1 rounded-lg text-xs bg-primary-500 text-white hover:bg-primary-600 transition-colors"
              >
                添加
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddTask(true)}
            className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-primary-300 hover:text-primary-500 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-xs font-medium">分配任务</span>
          </button>
        )
      )}
    </div>
  )
}
