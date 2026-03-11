import type { Priority } from '../../types'

const config: Record<Priority, { label: string; className: string }> = {
  high: { label: '高', className: 'bg-red-100 text-red-700' },
  medium: { label: '中', className: 'bg-amber-100 text-amber-700' },
  low: { label: '低', className: 'bg-green-100 text-green-700' },
}

export default function PriorityBadge({ priority }: { priority: Priority }) {
  const { label, className } = config[priority]
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}
