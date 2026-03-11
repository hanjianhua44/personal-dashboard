import { useState } from 'react'
import { Plus, Trash2, Tag, Search, CalendarPlus } from 'lucide-react'
import type { BacklogItem, TodayTask } from '../../types'
import { generateId, getToday } from '../../utils/helpers'

interface Props {
  items: BacklogItem[]
  onAdd: (item: BacklogItem) => void
  onUpdate: (id: string, patch: Partial<BacklogItem>) => void
  onDelete: (id: string) => void
  onMoveToToday: (task: TodayTask) => void
}

const PRESET_TAGS = ['技术', '文档', '会议', '沟通', '学习', '其他']

export default function BacklogPanel({ items, onAdd, onUpdate, onDelete, onMoveToToday }: Props) {
  const [showInput, setShowInput] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newTags, setNewTags] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTag, setFilterTag] = useState<string | null>(null)

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
      createdAt: new Date().toISOString(),
    })
    onDelete(item.id)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">待办清单</h1>
          <p className="text-sm text-slate-500 mt-1">
            {items.filter(i => !i.completed).length} 项待办 / {items.length} 总计
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="搜索待办..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        <button
          onClick={() => setFilterTag(null)}
          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
            !filterTag ? 'bg-primary-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          全部
        </button>
        {allTags.map(tag => (
          <button
            key={tag}
            onClick={() => setFilterTag(filterTag === tag ? null : tag)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              filterTag === tag ? 'bg-primary-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map(item => (
          <div
            key={item.id}
            className={`group flex items-center gap-3 p-3 rounded-xl border transition-all ${
              item.completed
                ? 'bg-slate-50 border-slate-100'
                : 'bg-white border-slate-200 shadow-sm hover:shadow'
            }`}
          >
            <input
              type="checkbox"
              checked={item.completed}
              onChange={() => onUpdate(item.id, { completed: !item.completed })}
              className="w-5 h-5 rounded border-slate-300 text-primary-500 focus:ring-primary-400 cursor-pointer shrink-0"
            />
            <div className="flex-1 min-w-0">
              <span className={`text-sm ${item.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                {item.title}
              </span>
              {item.tags.length > 0 && (
                <div className="flex gap-1 mt-1">
                  {item.tags.map(tag => (
                    <span key={tag} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-xs">
                      <Tag className="w-3 h-3" />{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="hidden group-hover:flex items-center gap-1">
              {!item.completed && (
                <button
                  onClick={() => moveToToday(item)}
                  title="移到今日重点"
                  className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-500 transition-colors"
                >
                  <CalendarPlus className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => onDelete(item.id)}
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
          <p className="text-lg mb-1">{searchQuery || filterTag ? '没有匹配的待办' : '清单是空的'}</p>
          <p className="text-sm">点击下方按钮添加待办事项</p>
        </div>
      )}

      {showInput ? (
        <div className="mt-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <input
            type="text"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="输入待办内容..."
            autoFocus
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
          />
          <div className="flex flex-wrap gap-1.5 mt-3">
            {PRESET_TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  newTags.includes(tag) ? 'bg-primary-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
          <div className="flex justify-end gap-2 mt-3">
            <button
              onClick={() => { setShowInput(false); setNewTitle(''); setNewTags([]) }}
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
          <span className="text-sm font-medium">添加待办</span>
        </button>
      )}
    </div>
  )
}
