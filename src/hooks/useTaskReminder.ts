import { useEffect, useRef } from 'react'
import type { TodayTask } from '../types'
import { getToday } from '../utils/helpers'

const CHECK_INTERVAL = 30_000 // 30s

export function useTaskReminder(tasks: TodayTask[]) {
  const notifiedIds = useRef(new Set<string>())

  useEffect(() => {
    if (!('Notification' in window)) return

    if (Notification.permission === 'default') {
      Notification.requestPermission()
    }

    function check() {
      if (Notification.permission !== 'granted') return

      const today = getToday()
      const now = new Date()
      const currentTime = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0')

      tasks
        .filter(t => t.date === today && t.time && !t.completed && t.time <= currentTime && !notifiedIds.current.has(t.id))
        .forEach(t => {
          notifiedIds.current.add(t.id)
          new Notification('任务提醒', {
            body: `「${t.title}」已到设定时间 ${t.time}，还未完成`,
            icon: '/vite.svg',
            tag: t.id,
          })
        })
    }

    check()
    const id = setInterval(check, CHECK_INTERVAL)
    return () => clearInterval(id)
  }, [tasks])
}
