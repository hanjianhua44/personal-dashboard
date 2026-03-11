import { useState } from 'react'
import {
  Plus, Trash2, Star, Search, Tag, ChevronDown, ChevronRight,
} from 'lucide-react'
import type { Idea } from '../../types'
import { generateId } from '../../utils/helpers'

interface Props {
  ideas: Idea[]
  onAdd: (idea: Idea) => void
  onUpdate: (id: string, patch: Partial<Idea>) => void
  onDelete: (id: string) => void
}

const PRESET_TAGS = [
  'VLA架构', 'World Model', 'E2E自动驾驶', 'Action Tokenization',
  'RL策略优化', '数据/预训练', '空间感知/3D', '多模态架构',
  'Chain-of-Thought', '高效推理', '仿真/数据生成', '规划与控制',
  '安全/Benchmark', '机器人操作', '工程/工具', '其他',
]

const TAG_COLOR_POOL = [
  'bg-violet-100 text-violet-600',
  'bg-indigo-100 text-indigo-600',
  'bg-cyan-100 text-cyan-600',
  'bg-pink-100 text-pink-600',
  'bg-amber-100 text-amber-600',
  'bg-emerald-100 text-emerald-600',
  'bg-rose-100 text-rose-600',
  'bg-teal-100 text-teal-600',
  'bg-orange-100 text-orange-600',
  'bg-blue-100 text-blue-600',
  'bg-fuchsia-100 text-fuchsia-600',
  'bg-lime-100 text-lime-600',
  'bg-sky-100 text-sky-600',
  'bg-red-100 text-red-600',
  'bg-purple-100 text-purple-600',
  'bg-slate-100 text-slate-500',
]

function getTagColor(tag: string): string {
  const idx = PRESET_TAGS.indexOf(tag)
  if (idx >= 0) return TAG_COLOR_POOL[idx % TAG_COLOR_POOL.length]
  let hash = 0
  for (let i = 0; i < tag.length; i++) hash = ((hash << 5) - hash) + tag.charCodeAt(i)
  return TAG_COLOR_POOL[Math.abs(hash) % TAG_COLOR_POOL.length]
}

export default function IdeasPanel({ ideas, onAdd, onUpdate, onDelete }: Props) {
  const [showInput, setShowInput] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDetail, setNewDetail] = useState('')
  const [newTags, setNewTags] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTag, setFilterTag] = useState<string | null>(null)
  const [showStarredOnly, setShowStarredOnly] = useState(false)
  const [expandedIdea, setExpandedIdea] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDetail, setEditDetail] = useState('')

  const allTags = Array.from(new Set(ideas.flatMap(i => i.tags).concat(PRESET_TAGS)))

  const filtered = ideas.filter(idea => {
    if (searchQuery && !idea.title.toLowerCase().includes(searchQuery.toLowerCase())
        && !idea.detail.toLowerCase().includes(searchQuery.toLowerCase())) return false
    if (filterTag && !idea.tags.includes(filterTag)) return false
    if (showStarredOnly && !idea.starred) return false
    return true
  }).sort((a, b) => {
    if (a.starred !== b.starred) return a.starred ? -1 : 1
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  function handleAdd() {
    if (!newTitle.trim()) return
    onAdd({
      id: generateId(),
      title: newTitle.trim(),
      detail: newDetail.trim(),
      tags: newTags,
      starred: false,
      createdAt: new Date().toISOString(),
    })
    setNewTitle('')
    setNewDetail('')
    setNewTags([])
    setShowInput(false)
  }

  function toggleTag(tag: string) {
    setNewTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }

  function startEdit(idea: Idea) {
    setEditingId(idea.id)
    setEditDetail(idea.detail)
  }

  function saveEdit(id: string) {
    onUpdate(id, { detail: editDetail })
    setEditingId(null)
  }

  function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return '刚刚'
    if (mins < 60) return `${mins}分钟前`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}小时前`
    const days = Math.floor(hours / 24)
    if (days < 30) return `${days}天前`
    const months = Math.floor(days / 30)
    return `${months}个月前`
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <span className="text-base">💡</span> 灵感记录
          </h1>
          <p className="text-[10px] text-slate-500 mt-0.5">{ideas.length} 个想法</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <div className="flex-1 relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-violet-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="搜索想法..."
            className="w-full pl-7 pr-2 py-1.5 rounded-lg border border-slate-200 text-[11px] focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent transition-shadow"
          />
        </div>
        <button
          onClick={() => setShowStarredOnly(!showStarredOnly)}
          className={`p-1.5 rounded-lg transition-all ${showStarredOnly ? 'bg-amber-100 text-amber-500 shadow-sm shadow-amber-100' : 'text-slate-300 hover:bg-amber-50 hover:text-amber-400'}`}
          title="只看收藏"
        >
          <Star className="w-3.5 h-3.5" fill={showStarredOnly ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="flex flex-wrap gap-1 mb-3">
        <button
          onClick={() => setFilterTag(null)}
          className={`px-2 py-0.5 rounded-full text-xs font-medium transition-all ${
            !filterTag ? 'bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          全部
        </button>
        {allTags.map(tag => (
          <button
            key={tag}
            onClick={() => setFilterTag(filterTag === tag ? null : tag)}
            className={`px-2 py-0.5 rounded-full text-xs font-medium transition-all ${
              filterTag === tag ? 'bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow-sm' : getTagColor(tag)
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="space-y-1.5">
        {filtered.map(idea => {
          const isExpanded = expandedIdea === idea.id
          return (
            <div
              key={idea.id}
              className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-all hover:border-violet-200 hover:shadow-md hover:shadow-violet-50"
            >
              <div className="group flex items-center gap-2 p-2.5">
                <button
                  onClick={() => setExpandedIdea(isExpanded ? null : idea.id)}
                  className="shrink-0 text-slate-300 hover:text-violet-500 transition-colors"
                >
                  {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => onUpdate(idea.id, { starred: !idea.starred })}
                  className={`shrink-0 transition-all ${idea.starred ? 'text-amber-400 scale-110' : 'text-slate-300 hover:text-amber-400'}`}
                >
                  <Star className="w-3.5 h-3.5" fill={idea.starred ? 'currentColor' : 'none'} />
                </button>
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-slate-700 font-medium">{idea.starred && '⭐ '}{idea.title}</span>
                  {idea.tags.length > 0 && (
                    <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                      {idea.tags.map(tag => (
                        <span key={tag} className={`inline-flex items-center gap-0.5 px-1.5 py-0 rounded-full text-[10px] font-medium ${getTagColor(tag)}`}>
                          <Tag className="w-2.5 h-2.5" />{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-slate-300 shrink-0">{timeAgo(idea.createdAt)}</span>
                <button
                  onClick={() => onDelete(idea.id)}
                  className="hidden group-hover:block p-1 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {isExpanded && (
                <div className="px-4 pb-3 pt-0 border-t border-slate-100">
                  <p className="text-[10px] text-violet-400 font-semibold mt-2 mb-1 uppercase tracking-wider">详细描述</p>
                  {editingId === idea.id ? (
                    <div>
                      <textarea
                        value={editDetail}
                        onChange={e => setEditDetail(e.target.value)}
                        rows={4}
                        autoFocus
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent resize-none"
                        placeholder="详细描述你的想法..."
                      />
                      <div className="flex justify-end gap-1.5 mt-1">
                        <button onClick={() => setEditingId(null)} className="px-2 py-0.5 text-xs text-slate-400">取消</button>
                        <button onClick={() => saveEdit(idea.id)} className="px-2 py-0.5 rounded-lg text-xs bg-gradient-to-r from-violet-500 to-pink-500 text-white">保存</button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => startEdit(idea)}
                      className="px-2 py-1.5 rounded-lg bg-violet-50/50 text-xs text-slate-500 cursor-pointer hover:bg-violet-50 min-h-[2rem] whitespace-pre-wrap transition-colors"
                    >
                      {idea.detail || <span className="text-slate-300 italic">点击记录详细想法...</span>}
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
          <div className="text-3xl mb-2 animate-float">🧠</div>
          <p className="text-xs font-medium mb-0.5">{searchQuery || filterTag ? '没有匹配的想法' : '还没有灵感记录'}</p>
          <p className="text-[10px]">脑子里冒出什么就记下来</p>
        </div>
      )}

      {showInput ? (
        <div className="mt-3 p-3 bg-white rounded-xl border border-violet-100 shadow-lg shadow-violet-50">
          <input
            type="text"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && newTitle.trim() && handleAdd()}
            placeholder="一句话概括想法..."
            autoFocus
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent"
          />
          <textarea
            value={newDetail}
            onChange={e => setNewDetail(e.target.value)}
            rows={3}
            placeholder="展开说说...（可选）"
            className="w-full mt-2 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent resize-none"
          />
          <div className="flex flex-wrap gap-1 mt-2">
            {PRESET_TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-2 py-0.5 rounded-full text-xs font-medium transition-all ${
                  newTags.includes(tag) ? 'bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow-sm' : getTagColor(tag)
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
          <div className="flex justify-end gap-1.5 mt-2">
            <button
              onClick={() => { setShowInput(false); setNewTitle(''); setNewDetail(''); setNewTags([]) }}
              className="px-2 py-1 rounded-lg text-xs text-slate-500 hover:bg-slate-100"
            >
              取消
            </button>
            <button
              onClick={handleAdd}
              className="px-3 py-1 rounded-lg text-xs bg-gradient-to-r from-violet-500 to-pink-500 text-white hover:shadow-lg hover:shadow-violet-200 transition-all"
            >
              记录
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowInput(true)}
          className="mt-3 w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 border-dashed border-violet-200 text-violet-400 hover:border-violet-400 hover:text-violet-600 hover:bg-violet-50/50 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span className="text-xs font-medium">记录想法</span>
        </button>
      )}
    </div>
  )
}
