<template>
  <UDashboardSidebar
    id="default"
    collapsible
    resizable
    class="bg-elevated/25"
    :ui="{ footer: 'lg:border-t lg:border-default', root: props.ui?.root }"
  >
    <template #header="{ collapsed }">
      <a href="/" class="flex items-center gap-2 overflow-hidden">
        <img
          class="size-8 shrink-0"
          src="~/assets/images/logo.svg"
          alt="Meilisearch Dashboard"
        />
        <span v-if="!collapsed" class="truncate text-lg font-semibold">
          Meilisearch Dashboard
        </span>
      </a>
    </template>

    <template #default="{ collapsed }">
      <UNavigationMenu
        :key="activePrefix"
        v-model="openItems"
        type="multiple"
        :items="visibleNavigation"
        orientation="vertical"
        :collapsed="collapsed"
      />
    </template>
  </UDashboardSidebar>
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useMeiliClient } from '~/composables'
import { safeToRefs } from '~/utils'
import { useChatAvailability, useCredentials, useTaskStream } from '~/stores'

const props = defineProps<{ ui?: { root?: string } }>()
const route = useRouter().currentRoute
const { available: chatAvailable } = safeToRefs(useChatAvailability())
const { credentials } = safeToRefs(useCredentials())

const indexUids = ref<string[]>([])
const indexDocCounts = ref<Record<string, number>>({})

const fetchIndexUids = async () => {
  if (!credentials.value) {
    indexUids.value = []
    indexDocCounts.value = {}
    return
  }
  try {
    const meili = useMeiliClient()
    const { results } = await meili.getIndexes({ limit: 100 })
    indexUids.value = results.map((index) => index.uid)
    const counts = await Promise.all(
      results.map(async (index) => {
        const stats = await meili.index(index.uid).getStats()
        return [index.uid, stats.numberOfDocuments] as const
      }),
    )
    indexDocCounts.value = Object.fromEntries(counts)
  } catch {
    indexUids.value = []
    indexDocCounts.value = {}
  }
}

watch(() => credentials.value?.id, fetchIndexUids, { immediate: true })

// Auto-open the Indexes group the first time it becomes active, but never
// auto-close it — only the user collapsing it by hand should do that. This
// state lives here (not in the item's `defaultOpen`) so it survives the
// :key remount below, which would otherwise reset it on every navigation.
const openItems = ref<string[]>([])
watch(
  () => route.value.name?.startsWith('indexes'),
  (isIndexesSection) => {
    if (isIndexesSection && !openItems.value.includes('indexes')) {
      openItems.value = [...openItems.value, 'indexes']
    }
  },
  { immediate: true },
)
// The list/counts can go stale after creating/renaming/deleting an index, or
// adding/removing documents, from any page in the indexes section — re-fetch
// on every navigation within it (not just when entering it), since those
// actions don't necessarily change the route's `indexes` prefix.
watch(
  () => (route.value.name?.startsWith('indexes') ? route.value.fullPath : null),
  (path) => path && fetchIndexUids(),
)
// Document counts also drift without any navigation at all (e.g. importing
// documents while staying on the same page). When the shared task stream
// (SSE `/tasks/stream`) is up, react to the relevant task types finishing
// instead of guessing an interval; otherwise fall back to polling.
const taskStream = useTaskStream()
const INDEX_AFFECTING_TASK_TYPES = new Set([
  'indexCreation',
  'indexUpdate',
  'indexDeletion',
  'indexSwap',
  'documentAdditionOrUpdate',
  'documentDeletion',
])
const unsubscribeTaskStream = taskStream.onTask((task) => {
  if (
    'succeeded' === task.status &&
    INDEX_AFFECTING_TASK_TYPES.has(task.type)
  ) {
    fetchIndexUids()
  }
})
onBeforeUnmount(unsubscribeTaskStream)

const REFRESH_INTERVAL_MS = 15_000
const refreshInterval = setInterval(() => {
  if (
    credentials.value &&
    route.value.name?.startsWith('indexes') &&
    !taskStream.active
  ) {
    fetchIndexUids()
  }
}, REFRESH_INTERVAL_MS)
onBeforeUnmount(() => clearInterval(refreshInterval))

const NAV_ITEMS: {
  label: string
  icon: string
  to: string
  prefix: string
  requiresChat?: boolean
}[] = [
  {
    label: 'Indexes',
    icon: 'heroicons:circle-stack',
    to: '/indexes',
    prefix: 'indexes',
  },
  {
    label: 'Access Keys',
    icon: 'heroicons:key',
    to: '/keys',
    prefix: 'keys',
  },
  {
    label: 'Tasks',
    icon: 'heroicons:list-bullet',
    to: '/tasks',
    prefix: 'tasks',
  },
  {
    label: 'Network',
    icon: 'heroicons:globe-alt',
    to: '/network',
    prefix: 'network',
  },
  {
    label: 'Backup',
    icon: 'heroicons:archive-box',
    to: '/backup/dumps',
    prefix: 'backup',
  },
  {
    label: 'Webhooks',
    icon: 'heroicons:bolt',
    to: '/webhooks',
    prefix: 'webhooks',
  },
  {
    label: 'Search rules',
    icon: 'heroicons:adjustments-horizontal',
    to: '/search-rules',
    prefix: 'search-rules',
  },
  {
    label: 'Chat',
    icon: 'heroicons:chat-bubble-left-right',
    to: '/chat',
    prefix: 'chat',
    requiresChat: true,
  },
  {
    label: 'Experimental',
    icon: 'heroicons:beaker',
    to: '/experimental-features',
    prefix: 'experimental-features',
  },
]

// Entries without a `requiresChat` flag are always shown.
const visibleNavigation = computed<NavigationMenuItem[]>(() =>
  NAV_ITEMS.filter((item) => !item.requiresChat || chatAvailable.value).map(
    (item) => {
      const active = route.value.name?.startsWith(item.prefix) ?? false

      if ('indexes' !== item.prefix || 0 === indexUids.value.length) {
        return { label: item.label, icon: item.icon, to: item.to, active }
      }

      return {
        label: item.label,
        icon: item.icon,
        to: item.to,
        active,
        value: 'indexes',
        children: indexUids.value.map((uid) => ({
          label: uid,
          to: `/indexes/${uid}/documents`,
          active: uid === route.value.params.indexUid,
          badge:
            undefined === indexDocCounts.value[uid]
              ? undefined
              : {
                  label: indexDocCounts.value[uid].toLocaleString(),
                  class: 'rounded-full',
                },
        })),
      }
    },
  ),
)

// UNavigationMenu only picks up an item's `active` flag once, at mount, so it
// is force-remounted (via :key) whenever the active section — or, for
// Indexes, the selected index or the index list itself — changes.
const activePrefix = computed(() => {
  const prefix =
    NAV_ITEMS.find((item) => route.value.name?.startsWith(item.prefix))
      ?.prefix ?? ''
  return [prefix, route.value.params.indexUid, indexUids.value.join(',')]
    .filter(Boolean)
    .join(':')
})
</script>
