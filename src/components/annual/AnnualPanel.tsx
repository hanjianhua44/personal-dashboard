import { useState } from 'react'
import { Plus, Trash2, ChevronDown, ChevronRight, CheckCircle2, Circle } from 'lucide-react'
import type { AnnualGoal, GoalStatus, Milestone } from '../../types'
import { generateId } from '../../utils/helpers'

interface Props {
  goals: AnnualGoal[]
  onAdd: (goal: AnnualGoal) => void
  onUpdate: (id: string, patch: Partial<AnnualGoal>) => void
  onDelete: (id: string) => void
}

const statusConfig: Record<GoalStatus, { label: string; emoji: string; className: string }> = {
  not_started: { label: '未开始', emoji: '⏳', className: 'bg-slate-100 text-slate-500' },
  in_progress: { label: '进行中', emoji: '🔥', className: 'bg-amber-100 text-amber-600' },
  completed: { label: '已完成', emoji: '🎉', className: 'bg-emerald-100 text-emerald-600' },
}

export default function AnnualPanel({ goals, onAdd, onUpdate, onDelete }: Props) {
  const [showInput, setShowInput] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null)
  const [newMilestone, setNewMilestone] = useState('')

  const year = new Date().getFullYear()
  const yearGoals = goals.filter(g => g.year === year)
  const completedCount = yearGoals.filter(g => g.status === 'completed').length
  const overallProgress = yearGoals.length > 0 ? Math.round((completedCount / yearGoals.length) * 100) : 0

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
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <span className="text-base">🎯</span> {year} 年度目标
          </h1>
          <p className="text-[10px] text-slate-500 mt-0.5">
            {completedCount}/{yearGoals.length} 个目标已完成
          </p>
        </div>
      </div>

      {yearGoals.length > 0 && (
        <div className="mb-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-amber-700">年度总进度</span>
            <span className="text-sm font-bold text-amber-600">{overallProgress}%</span>
          </div>
          <div className="h-2.5 bg-white/80 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          {overallProgress === 100 && (
            <p className="text-xs text-amber-600 mt-1.5 font-medium">所有目标已完成！太棒了！ 🏆</p>
          )}
        </div>
      )}

      <div className="space-y-3">
        {yearGoals.map(goal => {
          const isExpanded = expandedGoal === goal.id
          const stCfg = statusConfig[goal.status]
          return (
            <div key={goal.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:border-amber-200 hover:shadow-md hover:shadow-amber-50 transition-all">
              <div className="flex items-center gap-3 p-4">
                <button
                  onClick={() => setExpandedGoal(isExpanded ? null : goal.id)}
                  className="shrink-0 text-slate-300 hover:text-amber-500 transition-colors"
                >
                  {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-700">{goal.title}</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${stCfg.className}`}>
                      {stCfg.emoji} {stCfg.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-1 h-2 bg-amber-50 rounded-full max-w-48">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-amber-500">{goal.progress}%</span>
                  </div>
                </div>
                <select
                  value={goal.status}
                  onChange={e => onUpdate(goal.id, {
                    status: e.target.value as GoalStatus,
                    progress: e.target.value === 'completed' ? 100 : goal.progress,
                  })}
                  className="text-xs border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-amber-300"
                >
                  {Object.entries(statusConfig).map(([value, cfg]) => (
                    <option key={value} value={value}>{cfg.emoji} {cfg.label}</option>
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
                  <p className="text-[10px] text-amber-400 font-semibold mt-3 mb-2 uppercase tracking-wider">🏁 里程碑</p>
                  <div className="space-y-1.5">
                    {goal.milestones.map(ms => (
                      <div key={ms.id} className="group flex items-center gap-2 py-1">
                        <button onClick={() => toggleMilestone(goal.id, ms.id)} className="shrink-0">
                          {ms.completed
                            ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            : <Circle className="w-4 h-4 text-slate-300" />
                          }
                        </button>
                        <span className={`text-sm flex-1 ${ms.completed ? 'line-through text-slate-400' : 'text-slate-600'}`}>
                          {ms.completed && '✅ '}{ms.title}
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
                      className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent"
                    />
                    <button
                      onClick={() => addMilestone(goal.id)}
                      className="px-3 py-1.5 rounded-lg text-sm bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
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
          <div className="text-4xl mb-3 animate-float">🌟</div>
          <p className="text-sm font-medium mb-1">还没有设定年度目标</p>
          <p className="text-xs">新的一年，设定一些值得追求的目标吧</p>
        </div>
      )}

      {showInput ? (
        <div className="mt-4 p-4 bg-white rounded-xl border border-amber-100 shadow-lg shadow-amber-50">
          <input
            type="text"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="输入年度目标..."
            autoFocus
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent"
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
              className="px-4 py-1.5 rounded-lg text-sm bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg hover:shadow-amber-200 transition-all"
            >
              添加
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowInput(true)}
          className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-amber-200 text-amber-400 hover:border-amber-400 hover:text-amber-600 hover:bg-amber-50/50 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span className="text-sm font-medium">添加年度目标</span>
        </button>
      )}
    </div>
  )
}
