<template>
  <UDashboardGroup unit="rem" class="h-full" :class="groupClass">
    <LayoutSidebar :ui="sidebarUi" />
    <UDashboardPanel
      class="overflow-hidden"
      :ui="{ root: panelRootClass, body: 'p-0 sm:p-0' }"
    >
      <template #header>
        <UDashboardNavbar>
          <template #left>
            <UDashboardSidebarCollapse />
            <USeparator orientation="vertical" class="h-4" />
            <LayoutInstanceSwitcher />
          </template>
          <template #right>
            <LayoutTopBar />
          </template>
        </UDashboardNavbar>
      </template>
      <template #body>
        <slot />
      </template>
    </UDashboardPanel>
  </UDashboardGroup>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSidebarType } from '~/composables'
import LayoutInstanceSwitcher from '~/components/layout/InstanceSwitcher.vue'
import LayoutSidebar from '~/components/layout/Sidebar.vue'
import LayoutTopBar from '~/components/layout/TopBar.vue'

const { type } = useSidebarType()

// The `sidebar` type keeps Nuxt UI's edge-to-edge default; `floating` and
// `inset` detach the sidebar and/or content panel into rounded, bordered
// cards with a gap between them.
const floatingCard =
  'lg:m-2 lg:rounded-lg lg:border lg:border-default lg:shadow-sm lg:bg-default'

// Floating/inset cards need a backdrop a shade darker than the card itself,
// otherwise the gap and rounded corners are invisible against a same-color page.
const groupClass = computed(() =>
  'sidebar' === type.value ? '' : 'lg:bg-elevated',
)

const sidebarUi = computed(() => {
  if ('floating' === type.value) {
    return { root: floatingCard }
  }
  // The panel grows its own full border as a floating/inset card, so the
  // sidebar's default edge border would otherwise double up next to it.
  if ('inset' === type.value) {
    return { root: 'lg:border-e-0' }
  }
  return {}
})

const panelRootClass = computed(() => {
  if ('floating' === type.value) {
    return `${floatingCard} lg:ms-0`
  }
  if ('inset' === type.value) {
    return `${floatingCard} lg:ms-0`
  }
  return ''
})
</script>
