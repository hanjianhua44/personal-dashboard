import { useState } from 'react'
import { Plus, Trash2, ChevronDown, ChevronRight, CheckCircle2, Circle } from 'lucide-react'
import type { AnnualGoal, GoalStatus, Milestone } from '../../types'
import { GoalStatusBadge } from '../ui/StatusBadge'
import { generateId } from '../../utils/helpers'

interface Props {
  goals: AnnualGoal[]
  onAdd: (goal: AnnualGoal) => void
  onUpdate: (id: string, patch: Partial<AnnualGoal>) => void
  onDelete: (id: string) => void
}

const statusOptions: { value: GoalStatus; label: string }[] = [
  { value: 'not_started', label: '未开始' },
  { value: 'in_progress', label: '进行中' },
  { value: 'completed', label: '已完成' },
]

export default function AnnualPanel({ goals, onAdd, onUpdate, onDelete }: Props) {
  const [showInput, setShowInput] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null)
  const [newMilestone, setNewMilestone] = useState('')

  const year = new Date().getFullYear()
  const yearGoals = goals.filter(g => g.year === year)
  const completedCount = yearGoals.filter(g => g.status === 'completed').length

  function handleAdd() {
    if (!newTitle.trim()) return
    onAdd({
      id: generateId(),
      title: newTitle.trim(),
      status: 'not_started',
      progress: 0,
      milestones: [],
      year,
      createdAt: new Date().toISOString(),
    })
    setNewTitle('')
    setShowInput(false)
  }

  function addMilestone(goalId: string) {
    if (!newMilestone.trim()) return
    const goal = goals.find(g => g.id === goalId)
    if (!goal) return
    const ms: Milestone = { id: generateId(), title: newMilestone.trim(), completed: false }
    onUpdate(goalId, { milestones: [...goal.milestones, ms] })
    setNewMilestone('')
  }

  function toggleMilestone(goalId: string, msId: string) {
    const goal = goals.find(g => g.id === goalId)
    if (!goal) return
    const updated = goal.milestones.map(m => m.id === msId ? { ...m, completed: !m.completed } : m)
    const completedMs = updated.filter(m => m.completed).length
    const progress = updated.length > 0 ? Math.round((completedMs / updated.length) * 100) : goal.progress
    onUpdate(goalId, { milestones: updated, progress })
  }

  function deleteMilestone(goalId: string, msId: string) {
    const goal = goals.find(g => g.id === goalId)
    if (!goal) return
    const updated = goal.milestones.filter(m => m.id !== msId)
    const completedMs = updated.filter(m => m.completed).length
    const progress = updated.length > 0 ? Math.round((completedMs / updated.length) * 100) : 0
    onUpdate(goalId, { milestones: updated, progress })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-sm font-bold text-slate-800">{year} 年度目标</h1>
          <p className="text-[10px] text-slate-500">
            {completedCount}/{yearGoals.length} 个目标已完成
          </p>
        </div>
      </div>

      {yearGoals.length > 0 && (
        <div className="mb-2 flex items-center gap-2">
          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-500"
              style={{ width: `${yearGoals.length > 0 ? (completedCount / yearGoals.length) * 100 : 0}%` }}
            />
          </div>
          <span className="text-sm font-medium text-slate-600">
            {yearGoals.length > 0 ? Math.round((completedCount / yearGoals.length) * 100) : 0}%
          </span>
        </div>
      )}

      <div className="space-y-3">
        {yearGoals.map(goal => {
          const isExpanded = expandedGoal === goal.id
          return (
            <div key={goal.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 p-4">
                <button
                  onClick={() => setExpandedGoal(isExpanded ? null : goal.id)}
                  className="shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-700">{goal.title}</span>
                    <GoalStatusBadge status={goal.status} />
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full max-w-48">
                      <div
                        className="h-full bg-primary-500 rounded-full transition-all duration-300"
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400">{goal.progress}%</span>
                  </div>
                </div>
                <select
                  value={goal.status}
                  onChange={e => onUpdate(goal.id, {
                    status: e.target.value as GoalStatus,
                    progress: e.target.value === 'completed' ? 100 : goal.progress,
                  })}
                  className="text-xs border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-400"
                >
                  {statusOptions.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <button
                  onClick={() => onDelete(goal.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {isExpanded && (
                <div className="px-4 pb-4 pt-0 border-t border-slate-100">
                  <p className="text-xs text-slate-400 font-medium mt-3 mb-2">里程碑</p>
                  <div className="space-y-1.5">
                    {goal.milestones.map(ms => (
                      <div key={ms.id} className="group flex items-center gap-2 py-1">
                        <button onClick={() => toggleMilestone(goal.id, ms.id)} className="shrink-0">
                          {ms.completed
                            ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                            : <Circle className="w-4 h-4 text-slate-300" />
                          }
                        </button>
                        <span className={`text-sm flex-1 ${ms.completed ? 'line-through text-slate-400' : 'text-slate-600'}`}>
                          {ms.title}
                        </span>
                        <button
                          onClick={() => deleteMilestone(goal.id, ms.id)}
                          className="hidden group-hover:block p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      value={newMilestone}
                      onChange={e => setNewMilestone(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addMilestone(goal.id)}
                      placeholder="添加里程碑..."
                      className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                    />
                    <button
                      onClick={() => addMilestone(goal.id)}
                      className="px-3 py-1.5 rounded-lg text-sm bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                    >
                      添加
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {yearGoals.length === 0 && !showInput && (
        <div className="text-center py-12 text-slate-400">
          <p className="text-sm mb-1">还没有设定年度目标</p>
          <p className="text-sm">新的一年，设定一些值得追求的目标吧</p>
        </div>
      )}

      {showInput ? (
        <div className="mt-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <input
            type="text"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="输入年度目标..."
            autoFocus
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
          />
          <div className="flex justify-end gap-2 mt-3">
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
      ) : (
        <button
          onClick={() => setShowInput(true)}
          className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-primary-300 hover:text-primary-500 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="text-sm font-medium">添加年度目标</span>
        </button>
      )}
    </div>
  )
}
