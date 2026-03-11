import { useRef } from 'react'
import { Download, Upload, AlertTriangle } from 'lucide-react'
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
      })
    }
  }

  const stats = {
    todayTasks: data.todayTasks.length,
    backlogItems: data.backlogItems.length,
    annualGoals: data.annualGoals.length,
    teamMembers: data.teamMembers.length,
    teamTasks: data.teamTasks.length,
  }

  return (
    <div>
      <h1 className="text-lg font-bold text-slate-800 mb-5">设置</h1>

      <div className="space-y-6">
        {/* Stats */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-600 mb-3">数据概览</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { label: '今日任务', count: stats.todayTasks },
              { label: '待办事项', count: stats.backlogItems },
              { label: '年度目标', count: stats.annualGoals },
              { label: '团队成员', count: stats.teamMembers },
              { label: '团队任务', count: stats.teamTasks },
            ].map(s => (
              <div key={s.label} className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-xl font-bold text-slate-800">{s.count}</p>
                <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Export / Import */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-600 mb-3">数据备份</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => exportData(data)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              导出 JSON 备份
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors text-sm font-medium"
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
          <p className="text-xs text-slate-400 mt-2">
            导出的文件包含所有目标、任务和团队数据，可随时导入恢复。
          </p>
        </section>

        {/* Danger zone */}
        <section className="bg-white rounded-xl border border-red-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-red-600 mb-3 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" />
            危险操作
          </h2>
          <button
            onClick={handleClear}
            className="px-4 py-2.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-sm font-medium"
          >
            清除所有数据
          </button>
          <p className="text-xs text-slate-400 mt-2">
            清除后数据将无法恢复，建议先导出备份。
          </p>
        </section>
      </div>
    </div>
  )
}
