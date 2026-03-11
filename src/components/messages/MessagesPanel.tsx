import { useState } from 'react'
import {
  Bell, Trash2, CheckCheck, Info, CheckCircle2, AlertTriangle, XCircle,
  Eye, Plus,
} from 'lucide-react'
import type { Message, MessageType } from '../../types'
import { generateId } from '../../utils/helpers'

interface Props {
  messages: Message[]
  onAdd: (msg: Message) => void
  onUpdate: (id: string, patch: Partial<Message>) => void
  onDelete: (id: string) => void
  onClearRead: () => void
}

const typeConfig: Record<MessageType, { icon: typeof Info; color: string; bg: string; glow: string }> = {
  info: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-50', glow: 'shadow-blue-100' },
  success: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50', glow: 'shadow-emerald-100' },
  warning: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50', glow: 'shadow-amber-100' },
  error: { icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-50', glow: 'shadow-rose-100' },
}

const SOURCE_PRESETS = ['cursor', 'awesome-vla-papers', 'feishu-bridge', 'manual']

const SOURCE_EMOJI: Record<string, string> = {
  cursor: '🤖',
  'awesome-vla-papers': '📄',
  'feishu-bridge': '💬',
  manual: '✏️',
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '刚刚'
  if (mins < 60) return `${mins} 分钟前`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} 小时前`
  const days = Math.floor(hours / 24)
  return `${days} 天前`
}

export default function MessagesPanel({ messages, onAdd, onUpdate, onDelete, onClearRead }: Props) {
  const [showInput, setShowInput] = useState(false)
  const [newContent, setNewContent] = useState('')
  const [newSource, setNewSource] = useState('manual')
  const [newType, setNewType] = useState<MessageType>('info')
  const [filterSource, setFilterSource] = useState<string | null>(null)

  const unreadCount = messages.filter(m => !m.read).length

  const allSources = Array.from(new Set(messages.map(m => m.source).concat(SOURCE_PRESETS)))

  const filtered = filterSource
    ? messages.filter(m => m.source === filterSource)
    : messages

  function handleAdd() {
    if (!newContent.trim()) return
    onAdd({
      id: generateId(),
      content: newContent.trim(),
      source: newSource,
      type: newType,
      read: false,
      createdAt: new Date().toISOString(),
    })
    setNewContent('')
    setShowInput(false)
  }

  function markAllRead() {
    messages.filter(m => !m.read).forEach(m => onUpdate(m.id, { read: true }))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <span className="text-base">🔔</span> 消息
          </h2>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[10px] font-bold shadow-sm shadow-rose-200 animate-pulse">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              title="全部已读"
              className="flex items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] text-slate-500 hover:bg-rose-50 hover:text-rose-500 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              全部已读
            </button>
          )}
          {messages.some(m => m.read) && (
            <button
              onClick={onClearRead}
              title="清除已读"
              className="flex items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] text-slate-500 hover:bg-rose-50 hover:text-rose-500 transition-colors"
            >
              <CheckCheck className="w-3 h-3" />
              清除已读
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mb-2">
        <button
          onClick={() => setFilterSource(null)}
          className={`px-2 py-0.5 rounded-full text-xs font-medium transition-all ${
            !filterSource ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          全部
        </button>
        {allSources.map(src => (
          <button
            key={src}
            onClick={() => setFilterSource(filterSource === src ? null : src)}
            className={`px-2 py-0.5 rounded-full text-xs font-medium transition-all ${
              filterSource === src ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            {SOURCE_EMOJI[src] || '📌'} {src}
          </button>
        ))}
      </div>

      <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1 scrollbar-thin">
        {filtered.length === 0 && !showInput && (
          <div className="text-center py-8 text-slate-400">
            <div className="text-3xl mb-2 animate-float">📬</div>
            <p className="text-xs font-medium">暂无消息</p>
            <p className="text-[10px]">一切风平浪静</p>
          </div>
        )}
        {filtered.map(msg => {
          const cfg = typeConfig[msg.type]
          const Icon = cfg.icon
          return (
            <div
              key={msg.id}
              className={`group flex items-start gap-2.5 p-2.5 rounded-xl transition-all cursor-pointer ${
                msg.read ? 'opacity-50 hover:opacity-80' : `${cfg.bg} shadow-sm ${cfg.glow}`
              }`}
              onClick={() => !msg.read && onUpdate(msg.id, { read: true })}
            >
              <div className={`shrink-0 mt-0.5 ${cfg.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs leading-snug ${msg.read ? 'text-slate-400' : 'text-slate-700 font-medium'}`}>
                  {msg.content}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-slate-400 bg-white/80 px-1.5 py-0.5 rounded-full font-medium">
                    {SOURCE_EMOJI[msg.source] || '📌'} {msg.source}
                  </span>
                  <span className="text-[10px] text-slate-300">{timeAgo(msg.createdAt)}</span>
                </div>
              </div>
              <button
                onClick={e => { e.stopPropagation(); onDelete(msg.id) }}
                className="hidden group-hover:block shrink-0 p-1 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )
        })}
      </div>

      {showInput ? (
        <div className="mt-3 p-3 bg-white rounded-xl border border-rose-100 shadow-lg shadow-rose-50">
          <input
            type="text"
            value={newContent}
            onChange={e => setNewContent(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="消息内容..."
            autoFocus
            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent"
          />
          <div className="flex items-center gap-3 mt-2">
            <select
              value={newSource}
              onChange={e => setNewSource(e.target.value)}
              className="px-2 py-1 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-300"
            >
              {SOURCE_PRESETS.map(s => <option key={s} value={s}>{SOURCE_EMOJI[s]} {s}</option>)}
            </select>
            <div className="flex gap-1">
              {(Object.keys(typeConfig) as MessageType[]).map(t => {
                const C = typeConfig[t].icon
                return (
                  <button
                    key={t}
                    onClick={() => setNewType(t)}
                    className={`p-1.5 rounded-lg transition-all ${
                      newType === t ? `${typeConfig[t].bg} ${typeConfig[t].color} shadow-sm` : 'bg-white text-slate-400 hover:bg-slate-100'
                    }`}
                    title={t}
                  >
                    <C className="w-3.5 h-3.5" />
                  </button>
                )
              })}
            </div>
            <div className="flex-1" />
            <button onClick={() => { setShowInput(false); setNewContent('') }} className="px-2 py-1 text-xs text-slate-400">
              取消
            </button>
            <button onClick={handleAdd} className="px-3 py-1 rounded-lg text-xs bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:shadow-lg hover:shadow-rose-200 transition-all">
              发送
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowInput(true)}
          className="mt-3 w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 border-dashed border-rose-200 text-rose-400 hover:border-rose-400 hover:text-rose-600 hover:bg-rose-50/50 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span className="text-xs font-medium">添加消息</span>
        </button>
      )}
    </div>
  )
}
