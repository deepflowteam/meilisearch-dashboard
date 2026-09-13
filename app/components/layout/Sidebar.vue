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
          alt="Meiliweb"
        />
        <span v-if="!collapsed" class="truncate text-lg font-semibold">
          Meiliweb
        </span>
      </a>
    </template>

    <template #default="{ collapsed }">
      <UNavigationMenu
        :key="activePrefix"
        :items="visibleNavigation"
        orientation="vertical"
        :collapsed="collapsed"
      />
    </template>
  </UDashboardSidebar>
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import { computed } from 'vue'
import { safeToRefs } from '~/utils'
import { useChatAvailability } from '~/stores'

const props = defineProps<{ ui?: { root?: string } }>()
const route = useRouter().currentRoute
const { available: chatAvailable } = safeToRefs(useChatAvailability())

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
    (item) => ({
      label: item.label,
      icon: item.icon,
      to: item.to,
      active: route.value.name?.startsWith(item.prefix) ?? false,
    }),
  ),
)

// UNavigationMenu only picks up an item's `active` flag once, at mount, so it
// is force-remounted (via :key) whenever the active section changes.
const activePrefix = computed(
  () =>
    NAV_ITEMS.find((item) => route.value.name?.startsWith(item.prefix))
      ?.prefix ?? '',
)
</script>
