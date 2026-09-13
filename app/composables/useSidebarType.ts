import { useLocalStorage } from '@vueuse/core'

export const SIDEBAR_TYPES = ['sidebar', 'floating', 'inset'] as const
export type SidebarType = (typeof SIDEBAR_TYPES)[number]

const type = useLocalStorage<SidebarType>('sidebar-type', 'sidebar')

export const useSidebarType = () => ({ type, typeOptions: SIDEBAR_TYPES })
