<template>
  <UDropdownMenu
    :items="instanceMenuItems"
    :content="{ align: 'start' }"
    :ui="{ content: 'w-72' }"
  >
    <UButton
      color="neutral"
      variant="ghost"
      icon="heroicons:server"
      trailing-icon="heroicons:chevron-down"
      :label="instanceLabel"
      :ui="{ label: 'max-w-48 truncate' }"
    />
    <template #instance="{ item }">
      <span class="flex w-full items-center justify-between text-xs">
        <button
          type="button"
          class="flex w-full items-center gap-2"
          @click="switchInstance(item.instance.id)"
        >
          <Icon name="heroicons:server" class="h-5 w-5" />
          <span class="flex flex-col items-start">
            <span>{{ item.instance.name || item.instance.baseUri }}</span>
            <span
              v-if="item.instance.name"
              class="text-xs text-gray-500 dark:text-gray-400"
            >
              {{ item.instance.baseUri }}
            </span>
          </span>
        </button>
        <button
          type="button"
          class="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          @click.stop="removeInstance(item.instance.id)"
        >
          <Icon name="heroicons:trash" class="h-4 w-4" />
        </button>
      </span>
    </template>
  </UDropdownMenu>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import { computed, reactive } from 'vue'
import { safeToRefs } from '~/utils'
import { useConfirmationDialog, useCredentials, useVersion } from '~/stores'

const { t } = useI18n()
const {
  credentials,
  records,
  switchInstance,
  removeInstance: doRemoveInstance,
} = safeToRefs(useCredentials())
const { confirm } = useConfirmationDialog()
const { version } = useVersion()

const self: any = reactive({
  records,
  savedInstances: computed(() => Array.from(self.records.values())),
})

const instanceLabel = computed(() => {
  if (!credentials.value) {
    return ''
  }
  const name = credentials.value.name || credentials.value.baseUri
  return version.value?.pkgVersion
    ? `${name} · ${version.value.pkgVersion}`
    : name
})

const instanceMenuItems = computed<DropdownMenuItem[][]>(() => [
  self.savedInstances
    .filter(({ id }: { id: string }) => id !== credentials.value?.id)
    .map((instance: any) => ({ slot: 'instance' as const, instance })),
  [
    {
      label: t('actions.connectToInstance'),
      icon: 'heroicons:plus-circle',
      to: '/login',
    },
  ],
])

const removeInstance = async (id: string) => {
  if (await confirm({ text: t('confirm.removeInstance') })) {
    doRemoveInstance(id)
  }
}
</script>

<i18n>
en:
  actions:
    connectToInstance: Connect to another instance
  confirm:
    removeInstance: Are you sure you want to log out from this instance?
</i18n>
