import type { Priority } from '../../types'

const config: Record<Priority, { label: string; className: string }> = {
  high: { label: '高', className: 'bg-gradient-to-r from-red-500 to-rose-400 text-white' },
  medium: { label: '中', className: 'bg-gradient-to-r from-amber-400 to-orange-400 text-white' },
  low: { label: '低', className: 'bg-gradient-to-r from-emerald-400 to-teal-400 text-white' },
}

export default function PriorityBadge({ priority }: { priority: Priority }) {
  const { label, className } = config[priority]
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm ${className}`}>
      {label}
    </span>
  )
}
