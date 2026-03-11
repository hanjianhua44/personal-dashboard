import { useState } from 'react'
import { Plus, ChevronLeft, ChevronRight, ArrowRight, Trash2 } from 'lucide-react'
import type { TodayTask, Priority } from '../../types'
import PriorityBadge from '../ui/PriorityBadge'
import { generateId, getToday, formatDisplayDate } from '../../utils/helpers'

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
  const [showInput, setShowInput] = useState(false)

  const todayStr = getToday()
  const isToday = selectedDate === todayStr

  const filtered = tasks
    .filter(t => t.date === selectedDate)
    .sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1
      const pOrder: Record<Priority, number> = { high: 0, medium: 1, low: 2 }
      return pOrder[a.priority] - pOrder[b.priority]
    })

  const doneCount = filtered.filter(t => t.completed).length

  function shiftDate(days: number) {
    const d = new Date(selectedDate + 'T00:00:00')
    d.setDate(d.getDate() + days)
    setSelectedDate(d.toISOString().slice(0, 10))
  }

  function handleAdd() {
    if (!newTitle.trim()) return
    onAdd({
      id: generateId(),
      title: newTitle.trim(),
      priority: newPriority,
      completed: false,
      date: selectedDate,
      createdAt: new Date().toISOString(),
    })
    setNewTitle('')
    setShowInput(false)
  }

  function moveToTomorrow(task: TodayTask) {
    const tomorrow = new Date(selectedDate + 'T00:00:00')
    tomorrow.setDate(tomorrow.getDate() + 1)
    onUpdate(task.id, { date: tomorrow.toISOString().slice(0, 10) })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">今日重点</h1>
          <p className="text-sm text-slate-500 mt-1">
            {formatDisplayDate(selectedDate)}
            {isToday && <span className="ml-2 text-primary-500 font-medium">TODAY</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => shiftDate(-1)} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
            <ChevronLeft className="w-5 h-5 text-slate-500" />
          </button>
          <button
            onClick={() => setSelectedDate(todayStr)}
            className="px-3 py-1.5 text-sm rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
          >
            今天
          </button>
          <button onClick={() => shiftDate(1)} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
            <ChevronRight className="w-5 h-5 text-slate-500" />
          </button>
        </div>
      </div>

      {filtered.length > 0 && (
        <div className="mb-4 flex items-center gap-3">
          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 rounded-full transition-all duration-500"
              style={{ width: `${(doneCount / filtered.length) * 100}%` }}
            />
          </div>
          <span className="text-sm text-slate-500 whitespace-nowrap">
            {doneCount}/{filtered.length} 完成
          </span>
        </div>
      )}

      <div className="space-y-2">
        {filtered.map(task => (
          <div
            key={task.id}
            className={`group flex items-center gap-3 p-3 rounded-xl border transition-all ${
              task.completed
                ? 'bg-slate-50 border-slate-100'
                : 'bg-white border-slate-200 shadow-sm hover:shadow'
            }`}
          >
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => onUpdate(task.id, { completed: !task.completed })}
              className="w-5 h-5 rounded border-slate-300 text-primary-500 focus:ring-primary-400 cursor-pointer shrink-0"
            />
            <span className={`flex-1 text-sm ${task.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
              {task.title}
            </span>
            <PriorityBadge priority={task.priority} />
            <div className="hidden group-hover:flex items-center gap-1">
              {!task.completed && (
                <button
                  onClick={() => moveToTomorrow(task)}
                  title="移到明天"
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => onDelete(task.id)}
                title="删除"
                className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && !showInput && (
        <div className="text-center py-12 text-slate-400">
          <p className="text-lg mb-1">暂无任务</p>
          <p className="text-sm">点击下方按钮添加今日目标</p>
        </div>
      )}

      {showInput ? (
        <div className="mt-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <input
            type="text"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="输入目标内容..."
            autoFocus
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
          />
          <div className="flex items-center justify-between mt-3">
            <div className="flex gap-1">
              {(['high', 'medium', 'low'] as Priority[]).map(p => (
                <button
                  key={p}
                  onClick={() => setNewPriority(p)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    newPriority === p
                      ? 'bg-primary-500 text-white'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {p === 'high' ? '高' : p === 'medium' ? '中' : '低'}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setShowInput(false); setNewTitle('') }}
                className="px-3 py-1.5 rounded-lg text-sm text-slate-500 hover:bg-slate-100 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAdd}
                className="px-4 py-1.5 rounded-lg text-sm bg-primary-500 text-white hover:bg-primary-600 transition-colors"
              >
                添加
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowInput(true)}
          className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-primary-300 hover:text-primary-500 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="text-sm font-medium">添加目标</span>
        </button>
      )}
    </div>
  )
}
