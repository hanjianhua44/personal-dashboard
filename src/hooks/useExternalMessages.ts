import { useEffect, useRef } from 'react'
import type { Message } from '../types'

const POLL_INTERVAL = 5000

export function useExternalMessages(onMerge: (msgs: Message[]) => void) {
  const onMergeRef = useRef(onMerge)
  onMergeRef.current = onMerge

  useEffect(() => {
    let active = true

    async function poll() {
      try {
        const resp = await fetch('/data/messages.json?t=' + Date.now())
        if (!resp.ok) return
        const msgs: Message[] = await resp.json()
        if (active && msgs.length > 0) {
          onMergeRef.current(msgs)
        }
      } catch {
        // file not available, ignore
      }
    }

    poll()
    const id = setInterval(poll, POLL_INTERVAL)
    return () => { active = false; clearInterval(id) }
  }, [])
}
