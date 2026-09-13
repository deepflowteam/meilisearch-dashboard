import { defineStore } from 'pinia'
import type { Task } from 'meilisearch'
import { useMeiliClient } from '~/composables'

type TaskListener = (task: Task) => void

/**
 * Meilisearch >= 1.52 (experimental `tasksStreamingRoute`) can push task updates over
 * `GET /tasks/stream` (SSE) instead of every consumer polling tasks individually. The client
 * doesn't wrap this route yet (it's not JSON request/response, so `httpRequest` doesn't fit
 * either), so we read the stream directly with `fetch`.
 *
 * Kept as a store so the single connection is shared across the app (Tasks page + sidebar)
 * instead of one stream per consumer. Falls back to per-consumer polling whenever the stream
 * can't be established (older instance, feature disabled, network error) — `active` tells
 * consumers whether to rely on `onTask` or keep polling themselves.
 */
export const useTaskStream = defineStore('task-stream', () => {
  const active = ref(false)
  const listeners = new Set<TaskListener>()
  let stopped = false

  const connect = async () => {
    const meili = useMeiliClient()
    const abort = new AbortController()
    try {
      const response = await fetch(
        `${meili.config.host.replace(/\/$/, '')}/tasks/stream`,
        {
          headers: {
            Authorization: `Bearer ${meili.config.apiKey}`,
            Accept: 'text/event-stream',
          },
          signal: abort.signal,
        },
      )
      if (!response.ok || !response.body) {
        throw new Error(`Unexpected status ${response.status}`)
      }
      active.value = true
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          break
        }
        buffer += decoder.decode(value, { stream: true })
        const events = buffer.split('\n\n')
        buffer = events.pop() ?? ''
        for (const event of events) {
          const dataLine = event
            .split('\n')
            .find((line) => line.startsWith('data:'))
          if (!dataLine) {
            continue
          }
          try {
            const task = JSON.parse(dataLine.slice(5).trim()) as Task
            listeners.forEach((listener) => listener(task))
          } catch {
            // Ignore a single malformed event rather than tearing down the stream.
          }
        }
      }
    } catch {
      // Instance doesn't support/allow the stream, or the connection dropped.
    } finally {
      active.value = false
      if (!stopped) {
        setTimeout(connect, 5000)
      }
    }
  }
  connect()

  const onTask = (listener: TaskListener) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }

  return {
    active: computed(() => active.value),
    onTask,
  }
})
