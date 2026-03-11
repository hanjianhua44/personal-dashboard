import { useState, useEffect, useRef } from 'react'
import {
  Plus, ChevronLeft, ChevronRight, Trash2, Clock,
  ChevronDown, ChevronRight as ChevronRightIcon, CheckCircle2, Circle,
} from 'lucide-react'
import type { TodayTask, Priority, SubTask } from '../../types'
import PriorityBadge from '../ui/PriorityBadge'
import { generateId, getToday, formatDate, formatDisplayDate } from '../../utils/helpers'

interface Props {
  tasks: TodayTask[]
  onAdd: (task: TodayTask) => void
  onUpdate: (id: string, patch: Partial<TodayTask>) => void
  onDelete: (id: string) => void
}

export default function TodayPanel({ tasks, onAdd, onUpdate, onDelete }: Props) {
  const [selectedDate, setSelectedDate] = useState(getToday())
  const [newTitle, setNewTitle] = useState('')
  const [newPriority, setNewPriority] = useState<Priority>('medium')
  const [newTime, setNewTime] = useState('')
  const [showInput, setShowInput] = useState(false)
  const [expandedTask, setExpandedTask] = useState<string | null>(null)
  const [newSubtask, setNewSubtask] = useState('')
  const [editingNote, setEditingNote] = useState<string | null>(null)
  const [noteText, setNoteText] = useState('')
  const carriedOver = useRef(false)

  const todayStr = getToday()
  const isToday = selectedDate === todayStr

  useEffect(() => {
    if (carriedOver.current) return
    carriedOver.current = true
    const incomplete = tasks.filter(t => !t.completed && t.date < todayStr)
    incomplete.forEach(t => onUpdate(t.id, { date: todayStr }))
  }, [tasks, todayStr, onUpdate])

  const filtered = tasks
    .filter(t => t.date === selectedDate)
    .sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1
      if (a.time && b.time) return a.time.localeCompare(b.time)
      if (a.time && !b.time) return -1
      if (!a.time && b.time) return 1
      const pOrder: Record<Priority, number> = { high: 0, medium: 1, low: 2 }
      return pOrder[a.priority] - pOrder[b.priority]
    })

  const doneCount = filtered.filter(t => t.completed).length
  const progress = filtered.length > 0 ? Math.round((doneCount / filtered.length) * 100) : 0

  function shiftDate(days: number) {
    const d = new Date(selectedDate + 'T12:00:00')
    d.setDate(d.getDate() + days)
    setSelectedDate(formatDate(d))
  }

  function handleAdd() {
    if (!newTitle.trim()) return
    onAdd({
      id: generateId(),
      title: newTitle.trim(),
      priority: newPriority,
      completed: false,
      date: selectedDate,
      time: newTime || undefined,
      subtasks: [],
      note: '',
      createdAt: new Date().toISOString(),
    })
    setNewTitle('')
    setNewTime('')
    setShowInput(false)
  }

  function addSubtask(taskId: string) {
    if (!newSubtask.trim()) return
    const task = tasks.find(t => t.id === taskId)
    if (!task) return
    const st: SubTask = { id: generateId(), title: newSubtask.trim(), completed: false }
    onUpdate(taskId, { subtasks: [...(task.subtasks || []), st] })
    setNewSubtask('')
  }

  function toggleSubtask(taskId: string, stId: string) {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return
    onUpdate(taskId, { subtasks: (task.subtasks || []).map(s => s.id === stId ? { ...s, completed: !s.completed } : s) })
  }

  function deleteSubtask(taskId: string, stId: string) {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return
    onUpdate(taskId, { subtasks: (task.subtasks || []).filter(s => s.id !== stId) })
  }

  function startEditNote(task: TodayTask) {
    setEditingNote(task.id)
    setNoteText(task.note || '')
  }

  function saveNote(taskId: string) {
    onUpdate(taskId, { note: noteText })
    setEditingNote(null)
    setNoteText('')
  }

  return (
    <div className="overflow-hidden">
      <div className="flex items-center justify-between mb-3 gap-2">
        <div className="min-w-0">
          <h1 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <span className="text-base">🎯</span> 今日重点
          </h1>
          <p className="text-[10px] text-slate-500 truncate mt-0.5">
            {formatDisplayDate(selectedDate)}
            {isToday && <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[9px] font-bold">TODAY</span>}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => shiftDate(-1)} className="p-1.5 rounded-lg hover:bg-indigo-50 transition-colors">
            <ChevronLeft className="w-4 h-4 text-indigo-400" />
          </button>
          <button
            onClick={() => setSelectedDate(todayStr)}
            className="px-2.5 py-1 text-xs rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-medium transition-colors"
          >
            今天
          </button>
          <button onClick={() => shiftDate(1)} className="p-1.5 rounded-lg hover:bg-indigo-50 transition-colors">
            <ChevronRight className="w-4 h-4 text-indigo-400" />
          </button>
        </div>
      </div>

      {filtered.length > 0 && (
        <div className="mb-3 flex items-center gap-2">
          <div className="flex-1 h-2 bg-indigo-50 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-indigo-500 whitespace-nowrap">
            {doneCount}/{filtered.length}
          </span>
          {progress === 100 && <span className="text-sm">🎉</span>}
        </div>
      )}

      <div className="space-y-1.5">
        {filtered.map(task => {
          const isExpanded = expandedTask === task.id
          const subtasks = task.subtasks || []
          const stDone = subtasks.filter(s => s.completed).length

          return (
            <div
              key={task.id}
              className={`rounded-xl border transition-all overflow-hidden ${
                task.completed
                  ? 'bg-emerald-50/50 border-emerald-100'
                  : 'bg-white border-slate-200 shadow-sm hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-50'
              }`}
            >
              <div className="group flex items-center gap-2 p-2.5">
                <button
                  onClick={() => setExpandedTask(isExpanded ? null : task.id)}
                  className="shrink-0 text-slate-300 hover:text-indigo-500 transition-colors"
                >
                  {isExpanded
                    ? <ChevronDown className="w-3.5 h-3.5" />
                    : <ChevronRightIcon className="w-3.5 h-3.5" />
                  }
                </button>
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => onUpdate(task.id, { completed: !task.completed })}
                  className="w-4 h-4 rounded-full border-slate-300 text-indigo-500 focus:ring-indigo-400 cursor-pointer shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className={`text-xs ${task.completed ? 'line-through text-slate-400' : 'text-slate-700 font-medium'}`}>
                    {task.completed && '✅ '}{task.title}
                  </span>
                  {(task.time || subtasks.length > 0) && (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {task.time && (
                        <span className={`inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full ${task.completed ? 'bg-slate-50 text-slate-300' : 'bg-amber-50 text-amber-600'}`}>
                          <Clock className="w-3 h-3" />{task.time}
                        </span>
                      )}
                      {subtasks.length > 0 && (
                        <span className="text-[10px] text-slate-400">{stDone}/{subtasks.length} 子任务</span>
                      )}
                    </div>
                  )}
                </div>
                {subtasks.length > 0 && (
                  <div className="w-12 h-1.5 bg-indigo-50 rounded-full overflow-hidden shrink-0">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full transition-all"
                      style={{ width: `${(stDone / subtasks.length) * 100}%` }}
                    />
                  </div>
                )}
                <PriorityBadge priority={task.priority} />
                <button
                  onClick={() => onDelete(task.id)}
                  className="hidden group-hover:block p-1 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {isExpanded && (
                <div className="px-4 pb-3 pt-0 border-t border-slate-100">
                  <p className="text-[10px] text-indigo-400 font-semibold mt-2.5 mb-1.5 uppercase tracking-wider">子任务</p>
                  <div className="space-y-1">
                    {subtasks.map(st => (
                      <div key={st.id} className="group/st flex items-center gap-2 py-0.5">
                        <button onClick={() => toggleSubtask(task.id, st.id)} className="shrink-0">
                          {st.completed
                            ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            : <Circle className="w-3.5 h-3.5 text-slate-300" />
                          }
                        </button>
                        <span className={`text-xs flex-1 ${st.completed ? 'line-through text-slate-400' : 'text-slate-600'}`}>
                          {st.title}
                        </span>
                        <button
                          onClick={() => deleteSubtask(task.id, st.id)}
                          className="hidden group-hover/st:block p-0.5 rounded hover:bg-red-50 text-slate-300 hover:text-red-500"
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
                      className="flex-1 px-2 py-1 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
                    />
                    <button
                      onClick={() => addSubtask(task.id)}
                      className="px-2 py-1 rounded-lg text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                    >
                      添加
                    </button>
                  </div>

                  <p className="text-[10px] text-indigo-400 font-semibold mt-3 mb-1.5 uppercase tracking-wider">备注</p>
                  {editingNote === task.id ? (
                    <div>
                      <textarea
                        value={noteText}
                        onChange={e => setNoteText(e.target.value)}
                        rows={2}
                        autoFocus
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent resize-none"
                        placeholder="记录备忘..."
                      />
                      <div className="flex justify-end gap-1.5 mt-1">
                        <button onClick={() => setEditingNote(null)} className="px-2 py-0.5 text-xs text-slate-400">取消</button>
                        <button onClick={() => saveNote(task.id)} className="px-2 py-0.5 rounded-lg text-xs bg-gradient-to-r from-indigo-500 to-purple-500 text-white">保存</button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => startEditNote(task)}
                      className="px-2 py-1.5 rounded-lg bg-slate-50 text-xs text-slate-500 cursor-pointer hover:bg-indigo-50 min-h-[1.5rem] whitespace-pre-wrap transition-colors"
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

      {filtered.length === 0 && !showInput && (
        <div className="text-center py-10 text-slate-400">
          <div className="text-3xl mb-2 animate-float">📝</div>
          <p className="text-xs font-medium mb-0.5">还没有安排任务</p>
          <p className="text-[10px]">点击下方按钮，规划今天的目标吧</p>
        </div>
      )}

      {showInput ? (
        <div className="mt-3 p-3 bg-white rounded-xl border border-indigo-100 shadow-lg shadow-indigo-50">
          <input
            type="text"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="输入目标内容..."
            autoFocus
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
          />
          <div className="flex items-center justify-between mt-2 gap-2">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <div className="flex gap-1">
                {(['high', 'medium', 'low'] as Priority[]).map(p => (
                  <button
                    key={p}
                    onClick={() => setNewPriority(p)}
                    className={`px-2 py-0.5 rounded-lg text-xs font-medium transition-all ${
                      newPriority === p
                        ? p === 'high' ? 'bg-gradient-to-r from-red-500 to-rose-400 text-white shadow-sm'
                          : p === 'medium' ? 'bg-gradient-to-r from-amber-500 to-orange-400 text-white shadow-sm'
                          : 'bg-gradient-to-r from-emerald-500 to-teal-400 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {p === 'high' ? '🔴 高' : p === 'medium' ? '🟡 中' : '🟢 低'}
                  </button>
                ))}
              </div>
              <input
                type="time"
                value={newTime}
                onChange={e => setNewTime(e.target.value)}
                className="px-1.5 py-0.5 rounded-lg border border-slate-200 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
              />
            </div>
            <div className="flex gap-1.5 shrink-0">
              <button
                onClick={() => { setShowInput(false); setNewTitle(''); setNewTime('') }}
                className="px-2 py-1 rounded-lg text-xs text-slate-500 hover:bg-slate-100 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAdd}
                className="px-3 py-1 rounded-lg text-xs bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:shadow-lg hover:shadow-indigo-200 transition-all"
              >
                添加
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowInput(true)}
          className="mt-3 w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 border-dashed border-indigo-200 text-indigo-400 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span className="text-xs font-medium">添加目标</span>
        </button>
      )}
    </div>
  )
}
