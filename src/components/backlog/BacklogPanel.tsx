import { useState } from 'react'
import {
  Plus, Trash2, Tag, Search, CalendarPlus,
  ChevronDown, ChevronRight, CheckCircle2, Circle,
} from 'lucide-react'
import type { BacklogItem, TodayTask, SubTask } from '../../types'
import { generateId, getToday } from '../../utils/helpers'

interface Props {
  items: BacklogItem[]
  onAdd: (item: BacklogItem) => void
  onUpdate: (id: string, patch: Partial<BacklogItem>) => void
  onDelete: (id: string) => void
  onMoveToToday: (task: TodayTask) => void
}

const PRESET_TAGS = ['技术', '文档', '会议', '沟通', '学习', '其他']

const TAG_COLORS: Record<string, string> = {
  '技术': 'bg-indigo-100 text-indigo-600',
  '文档': 'bg-cyan-100 text-cyan-600',
  '会议': 'bg-amber-100 text-amber-600',
  '沟通': 'bg-pink-100 text-pink-600',
  '学习': 'bg-emerald-100 text-emerald-600',
  '其他': 'bg-slate-100 text-slate-500',
}

export default function BacklogPanel({ items, onAdd, onUpdate, onDelete, onMoveToToday }: Props) {
  const [showInput, setShowInput] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newTags, setNewTags] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTag, setFilterTag] = useState<string | null>(null)
  const [expandedItem, setExpandedItem] = useState<string | null>(null)
  const [newSubtask, setNewSubtask] = useState('')
  const [editingNote, setEditingNote] = useState<string | null>(null)
  const [noteText, setNoteText] = useState('')

  const allTags = Array.from(new Set(items.flatMap(i => i.tags).concat(PRESET_TAGS)))

  const filtered = items.filter(item => {
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    if (filterTag && !item.tags.includes(filterTag)) return false
    return true
  }).sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  function handleAdd() {
    if (!newTitle.trim()) return
    onAdd({
      id: generateId(),
      title: newTitle.trim(),
      tags: newTags,
      completed: false,
      subtasks: [],
      note: '',
      createdAt: new Date().toISOString(),
    })
    setNewTitle('')
    setNewTags([])
    setShowInput(false)
  }

  function toggleTag(tag: string) {
    setNewTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }

  function moveToToday(item: BacklogItem) {
    onMoveToToday({
      id: generateId(),
      title: item.title,
      priority: 'medium',
      completed: false,
      date: getToday(),
      subtasks: item.subtasks || [],
      note: item.note || '',
      createdAt: new Date().toISOString(),
    })
    onDelete(item.id)
  }

  function addSubtask(itemId: string) {
    if (!newSubtask.trim()) return
    const item = items.find(i => i.id === itemId)
    if (!item) return
    const st: SubTask = { id: generateId(), title: newSubtask.trim(), completed: false }
    onUpdate(itemId, { subtasks: [...(item.subtasks || []), st] })
    setNewSubtask('')
  }

  function toggleSubtask(itemId: string, stId: string) {
    const item = items.find(i => i.id === itemId)
    if (!item) return
    onUpdate(itemId, { subtasks: (item.subtasks || []).map(s => s.id === stId ? { ...s, completed: !s.completed } : s) })
  }

  function deleteSubtask(itemId: string, stId: string) {
    const item = items.find(i => i.id === itemId)
    if (!item) return
    onUpdate(itemId, { subtasks: (item.subtasks || []).filter(s => s.id !== stId) })
  }

  function startEditNote(item: BacklogItem) {
    setEditingNote(item.id)
    setNoteText(item.note || '')
  }

  function saveNote(itemId: string) {
    onUpdate(itemId, { note: noteText })
    setEditingNote(null)
    setNoteText('')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <span className="text-base">📋</span> 待办清单
          </h1>
          <p className="text-[10px] text-slate-500 mt-0.5">
            {items.filter(i => !i.completed).length} 项待办 / {items.length} 总计
          </p>
        </div>
      </div>

      <div className="mb-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-cyan-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="搜索待办..."
            className="w-full pl-7 pr-2 py-1.5 rounded-lg border border-slate-200 text-[11px] focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:border-transparent transition-shadow"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mb-2">
        <button
          onClick={() => setFilterTag(null)}
          className={`px-2 py-0.5 rounded-full text-xs font-medium transition-all ${
            !filterTag ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          全部
        </button>
        {allTags.map(tag => (
          <button
            key={tag}
            onClick={() => setFilterTag(filterTag === tag ? null : tag)}
            className={`px-2 py-0.5 rounded-full text-xs font-medium transition-all ${
              filterTag === tag ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-sm' : TAG_COLORS[tag] || 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="space-y-1.5">
        {filtered.map(item => {
          const isExpanded = expandedItem === item.id
          const subtasks = item.subtasks || []
          const stDone = subtasks.filter(s => s.completed).length

          return (
            <div
              key={item.id}
              className={`rounded-xl border transition-all overflow-hidden ${
                item.completed
                  ? 'bg-emerald-50/50 border-emerald-100'
                  : 'bg-white border-slate-200 shadow-sm hover:border-cyan-200 hover:shadow-md hover:shadow-cyan-50'
              }`}
            >
              <div className="group flex items-center gap-2 p-2.5">
                <button
                  onClick={() => setExpandedItem(isExpanded ? null : item.id)}
                  className="shrink-0 text-slate-300 hover:text-cyan-500 transition-colors"
                >
                  {isExpanded
                    ? <ChevronDown className="w-3.5 h-3.5" />
                    : <ChevronRight className="w-3.5 h-3.5" />
                  }
                </button>
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => onUpdate(item.id, { completed: !item.completed })}
                  className="w-4 h-4 rounded-full border-slate-300 text-cyan-500 focus:ring-cyan-400 cursor-pointer shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className={`text-xs ${item.completed ? 'line-through text-slate-400' : 'text-slate-700 font-medium'}`}>
                    {item.completed && '✅ '}{item.title}
                  </span>
                  {(item.tags.length > 0 || subtasks.length > 0) && (
                    <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                      {item.tags.map(tag => (
                        <span key={tag} className={`inline-flex items-center gap-0.5 px-1.5 py-0 rounded-full text-[10px] font-medium ${TAG_COLORS[tag] || 'bg-slate-100 text-slate-500'}`}>
                          <Tag className="w-2.5 h-2.5" />{tag}
                        </span>
                      ))}
                      {subtasks.length > 0 && (
                        <span className="text-[10px] text-slate-400">{stDone}/{subtasks.length} 子任务</span>
                      )}
                    </div>
                  )}
                </div>
                {subtasks.length > 0 && (
                  <div className="w-12 h-1.5 bg-cyan-50 rounded-full overflow-hidden shrink-0">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 to-teal-400 rounded-full transition-all"
                      style={{ width: `${(stDone / subtasks.length) * 100}%` }}
                    />
                  </div>
                )}
                <div className="hidden group-hover:flex items-center gap-1">
                  {!item.completed && (
                    <button
                      onClick={() => moveToToday(item)}
                      title="移到今日重点"
                      className="p-1 rounded-lg hover:bg-indigo-50 text-slate-400 hover:text-indigo-500 transition-colors"
                    >
                      <CalendarPlus className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(item.id)}
                    title="删除"
                    className="p-1 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="px-4 pb-3 pt-0 border-t border-slate-100">
                  <p className="text-[10px] text-cyan-400 font-semibold mt-2.5 mb-1.5 uppercase tracking-wider">子任务</p>
                  <div className="space-y-1">
                    {subtasks.map(st => (
                      <div key={st.id} className="group/st flex items-center gap-2 py-0.5">
                        <button onClick={() => toggleSubtask(item.id, st.id)} className="shrink-0">
                          {st.completed
                            ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            : <Circle className="w-3.5 h-3.5 text-slate-300" />
                          }
                        </button>
                        <span className={`text-xs flex-1 ${st.completed ? 'line-through text-slate-400' : 'text-slate-600'}`}>
                          {st.title}
                        </span>
                        <button
                          onClick={() => deleteSubtask(item.id, st.id)}
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
                      value={expandedItem === item.id ? newSubtask : ''}
                      onChange={e => setNewSubtask(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addSubtask(item.id)}
                      placeholder="添加子任务..."
                      className="flex-1 px-2 py-1 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:border-transparent"
                    />
                    <button
                      onClick={() => addSubtask(item.id)}
                      className="px-2 py-1 rounded-lg text-xs bg-cyan-50 text-cyan-600 hover:bg-cyan-100"
                    >
                      添加
                    </button>
                  </div>

                  <p className="text-[10px] text-cyan-400 font-semibold mt-3 mb-1.5 uppercase tracking-wider">备注</p>
                  {editingNote === item.id ? (
                    <div>
                      <textarea
                        value={noteText}
                        onChange={e => setNoteText(e.target.value)}
                        rows={2}
                        autoFocus
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:border-transparent resize-none"
                        placeholder="记录备忘..."
                      />
                      <div className="flex justify-end gap-1.5 mt-1">
                        <button onClick={() => setEditingNote(null)} className="px-2 py-0.5 text-xs text-slate-400">取消</button>
                        <button onClick={() => saveNote(item.id)} className="px-2 py-0.5 rounded-lg text-xs bg-gradient-to-r from-cyan-500 to-teal-500 text-white">保存</button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => startEditNote(item)}
                      className="px-2 py-1.5 rounded-lg bg-slate-50 text-xs text-slate-500 cursor-pointer hover:bg-cyan-50 min-h-[1.5rem] whitespace-pre-wrap transition-colors"
                    >
                      {item.note || <span className="text-slate-300 italic">点击添加备注...</span>}
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
          <div className="text-3xl mb-2 animate-float">📭</div>
          <p className="text-xs font-medium mb-0.5">{searchQuery || filterTag ? '没有匹配的待办' : '清单是空的'}</p>
          <p className="text-[10px]">添加一些不紧急但重要的事情</p>
        </div>
      )}

      {showInput ? (
        <div className="mt-3 p-3 bg-white rounded-xl border border-cyan-100 shadow-lg shadow-cyan-50">
          <input
            type="text"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="输入待办内容..."
            autoFocus
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:border-transparent"
          />
          <div className="flex flex-wrap gap-1 mt-2">
            {PRESET_TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-2 py-0.5 rounded-full text-xs font-medium transition-all ${
                  newTags.includes(tag) ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-sm' : TAG_COLORS[tag] || 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
          <div className="flex justify-end gap-1.5 mt-2">
            <button
              onClick={() => { setShowInput(false); setNewTitle(''); setNewTags([]) }}
              className="px-2 py-1 rounded-lg text-xs text-slate-500 hover:bg-slate-100 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleAdd}
              className="px-3 py-1 rounded-lg text-xs bg-gradient-to-r from-cyan-500 to-teal-500 text-white hover:shadow-lg hover:shadow-cyan-200 transition-all"
            >
              添加
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowInput(true)}
          className="mt-3 w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 border-dashed border-cyan-200 text-cyan-400 hover:border-cyan-400 hover:text-cyan-600 hover:bg-cyan-50/50 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span className="text-xs font-medium">添加待办</span>
        </button>
      )}
    </div>
  )
}
