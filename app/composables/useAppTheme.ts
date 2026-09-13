import { useLocalStorage } from '@vueuse/core'
import { watch } from 'vue'
import {
  applyThemeColor,
  THEME_COLOR_NAMES,
  type ThemeColorName,
} from '~/utils'

const color = useLocalStorage<ThemeColorName>('theme-color', 'default')

let applied = false

export const useAppTheme = () => {
  if (!applied && import.meta.client) {
    applied = true
    watch(color, (value) => applyThemeColor(value), { immediate: true })
  }

  return { color, colorOptions: THEME_COLOR_NAMES }
}
