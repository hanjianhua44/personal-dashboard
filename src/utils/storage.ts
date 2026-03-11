import type { AppData } from '../types'

const STORAGE_KEY = 'personal-dashboard-data'

const defaultData: AppData = {
  todayTasks: [],
  backlogItems: [],
  annualGoals: [],
  teamMembers: [],
  teamTasks: [],
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...defaultData }
    return { ...defaultData, ...JSON.parse(raw) }
  } catch {
    return { ...defaultData }
  }
}

export function saveData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function exportData(data: AppData): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `dashboard-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function importData(file: File): Promise<AppData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string)
        resolve({ ...defaultData, ...data })
      } catch {
        reject(new Error('无法解析文件，请确认是有效的 JSON 备份'))
      }
    }
    reader.onerror = () => reject(new Error('读取文件失败'))
    reader.readAsText(file)
  })
}
