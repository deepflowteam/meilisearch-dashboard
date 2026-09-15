<template>
  <USlideover
    v-model:open="open"
    :title="t('title')"
    :description="t('description')"
  >
    <UButton
      color="neutral"
      variant="ghost"
      icon="heroicons:swatch"
      :aria-label="t('trigger')"
      v-tippy="t('trigger')"
    />

    <template #body>
      <div class="space-y-6">
        <div class="space-y-2">
          <p class="text-sm font-medium">{{ t('color') }}</p>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="name in colorOptions"
              :key="name"
              type="button"
              class="flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs capitalize"
              :class="
                color === name
                  ? 'border-primary bg-primary/10 border-2'
                  : 'border-default hover:bg-elevated/50'
              "
              @click="color = name"
            >
              <span
                class="size-4 shrink-0 rounded-full border border-white/50"
                :style="{ backgroundColor: THEME_COLOR_SWATCH[name] }"
              />
              {{ name }}
            </button>
          </div>
        </div>

        <div class="space-y-2">
          <p class="text-sm font-medium">{{ t('appearance') }}</p>
          <div class="grid grid-cols-3 gap-2">
            <UButton
              color="neutral"
              :variant="colorMode.preference === 'light' ? 'soft' : 'outline'"
              :class="
                colorMode.preference === 'light'
                  ? 'border-primary border-2'
                  : ''
              "
              icon="heroicons:sun"
              :label="t('light')"
              @click="colorMode.preference = 'light'"
            />
            <UButton
              color="neutral"
              :variant="colorMode.preference === 'dark' ? 'soft' : 'outline'"
              :class="
                colorMode.preference === 'dark' ? 'border-primary border-2' : ''
              "
              icon="heroicons:moon"
              :label="t('dark')"
              @click="colorMode.preference = 'dark'"
            />
            <UButton
              color="neutral"
              :variant="colorMode.preference === 'system' ? 'soft' : 'outline'"
              :class="
                colorMode.preference === 'system'
                  ? 'border-primary border-2'
                  : ''
              "
              icon="heroicons:computer-desktop"
              :label="t('system')"
              @click="colorMode.preference = 'system'"
            />
          </div>
        </div>

        <div class="space-y-2">
          <p class="text-sm font-medium">{{ t('sidebarType') }}</p>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="option in typeOptions"
              :key="option"
              type="button"
              class="rounded-md border px-2.5 py-1.5 text-xs capitalize"
              :class="
                type === option
                  ? 'border-primary bg-primary/10 border-2'
                  : 'border-default hover:bg-elevated/50'
              "
              @click="type = option"
            >
              {{ t(`sidebarTypes.${option}`) }}
            </button>
          </div>
        </div>
      </div>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAppTheme, useSidebarType } from '~/composables'
import { THEME_COLOR_SWATCH } from '~/utils'

const { color, colorOptions } = useAppTheme()
const { type, typeOptions } = useSidebarType()
const colorMode = useColorMode()
const open = ref(false)
const { t } = useI18n()
</script>

<i18n>
en:
  trigger: Theme settings
  title: Theme settings
  description: Customize the color and appearance of Meilisearch Dashboard.
  color: Color
  appearance: Appearance
  light: Light
  dark: Dark
  system: System
  sidebarType: Sidebar type
  sidebarTypes:
    sidebar: Sidebar
    floating: Floating
    inset: Inset
</i18n>
