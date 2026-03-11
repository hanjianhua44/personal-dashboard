import { useRef } from 'react'
import { Download, Upload, AlertTriangle, Database, Shield } from 'lucide-react'
import type { AppData } from '../../types'
import { exportData, importData } from '../../utils/storage'

interface Props {
  data: AppData
  onImport: (data: AppData) => void
}

export default function SettingsPanel({ data, onImport }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const imported = await importData(file)
      onImport(imported)
      alert('数据导入成功！')
    } catch (err) {
      alert(err instanceof Error ? err.message : '导入失败')
    }
    if (fileRef.current) fileRef.current.value = ''
  }

  function handleClear() {
    if (confirm('确定要清除所有数据吗？此操作不可恢复！')) {
      onImport({
        todayTasks: [],
        backlogItems: [],
        annualGoals: [],
        teamMembers: [],
        teamTasks: [],
        messages: [],
        ideas: [],
      })
    }
  }

  const stats = [
    { label: '今日任务', count: data.todayTasks.length, emoji: '🎯', color: 'from-indigo-400 to-purple-400' },
    { label: '待办事项', count: data.backlogItems.length, emoji: '📋', color: 'from-cyan-400 to-teal-400' },
    { label: '年度目标', count: data.annualGoals.length, emoji: '🏆', color: 'from-amber-400 to-orange-400' },
    { label: '灵感记录', count: (data.ideas || []).length, emoji: '💡', color: 'from-violet-400 to-pink-400' },
    { label: '团队成员', count: data.teamMembers.length, emoji: '👥', color: 'from-emerald-400 to-teal-400' },
    { label: '团队任务', count: data.teamTasks.length, emoji: '📌', color: 'from-rose-400 to-pink-400' },
  ]

  return (
    <div>
      <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-5">
        <span className="text-xl">⚙️</span> 设置
      </h1>

      <div className="space-y-5">
        <section className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-600 mb-3 flex items-center gap-1.5">
            <Database className="w-4 h-4 text-indigo-400" />
            数据概览
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {stats.map(s => (
              <div key={s.label} className="text-center p-3 rounded-xl bg-gradient-to-br from-slate-50 to-white border border-slate-100 hover:shadow-md transition-all">
                <div className="text-xl mb-1">{s.emoji}</div>
                <p className={`text-2xl font-bold bg-gradient-to-r ${s.color} bg-clip-text text-transparent`}>{s.count}</p>
                <p className="text-[10px] text-slate-500 mt-0.5 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-600 mb-3 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-emerald-400" />
            数据备份
          </h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => exportData(data)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:shadow-lg hover:shadow-indigo-200 transition-all text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              导出 JSON 备份
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 hover:shadow-md transition-all text-sm font-medium"
            >
              <Upload className="w-4 h-4" />
              导入备份文件
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-2">
            导出的文件包含所有目标、任务和团队数据，可随时导入恢复。
          </p>
        </section>

        <section className="bg-white/80 backdrop-blur-sm rounded-2xl border border-rose-200/60 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-rose-600 mb-3 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" />
            危险操作
          </h2>
          <button
            onClick={handleClear}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-50 to-red-50 text-rose-600 hover:from-rose-100 hover:to-red-100 hover:shadow-md hover:shadow-rose-100 transition-all text-sm font-medium border border-rose-200"
          >
            清除所有数据
          </button>
          <p className="text-[10px] text-slate-400 mt-2">
            清除后数据将无法恢复，建议先导出备份。
          </p>
        </section>
      </div>
    </div>
  )
}
