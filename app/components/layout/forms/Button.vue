<template>
  <UButton
    :as="as"
    :type="type"
    :disabled="disabled || loading"
    :loading="loading"
    :icon="icon"
    :trailing="iconOnRight"
    :color="color"
    :variant="variant"
    :size="'small' === size ? 'sm' : 'md'"
    :class="themeClasses"
    :ui="{ base: 'justify-center gap-2' }"
  >
    <span v-if="loading">{{ loadingText ?? t('loadingText') }}</span>
    <slot v-else>{{ text }}</slot>
  </UButton>
</template>

<script setup lang="ts">
import match from 'match-operator'

type Props = {
  // The underlying UButton/ULinkBase always renders as an <a> when `to`/`href` is set
  // regardless of `as` (see @nuxt/ui's LinkBase.vue), and its `as` prop is String-typed —
  // passing a component (e.g. NuxtLink) here fails Vue's prop validation for no benefit.
  as?: string
  type?: 'submit' | 'reset' | 'button' | undefined
  theme?: 'primary' | 'secondary'
  icon?: string
  iconOnRight?: boolean
  loading?: boolean
  loadingText?: string
  disabled?: boolean
  noBorder?: boolean
  noPadding?: boolean
  noRounded?: boolean
  size?: 'small'
}
const props = withDefaults(defineProps<Props>(), {
  as: 'button',
  disabled: false,
  loading: false,
  iconOnRight: false,
  noBorder: false,
  noPadding: false,
  noRounded: false,
})
const { t } = useI18n()
const type = computed(
  () => props.type ?? ('button' === props.as ? 'button' : undefined),
)
const isPrimary = computed(
  () => 'submit' === props.type || 'primary' === props.theme,
)
const isSecondary = computed(
  () => 'reset' === props.type || 'secondary' === props.theme,
)
const color = computed(() => (isPrimary.value ? 'primary' : 'neutral'))
const variant = computed(() =>
  isPrimary.value || isSecondary.value ? 'solid' : 'outline',
)
const themeClasses = computed(() => {
  const classes = []

  props.noBorder && classes.push('ring-0')
  props.noPadding && classes.push('p-0')
  props.noRounded ? classes.push('rounded-none') : classes.push('rounded-lg')
  isSecondary.value &&
    classes.push(
      'bg-gray-700 enabled:hover:bg-gray-600 dark:bg-gray-600 dark:enabled:hover:bg-gray-500',
    )

  return classes
})

const text = computed(() =>
  match(props.type, [
    ['submit', t('buttons.submit')],
    ['reset', t('buttons.cancel')],
    [match.default, ''],
  ]),
)
</script>

<i18n>
en:
  loadingText: Please wait...
  buttons:
    submit: Submit
    cancel: Cancel
</i18n>
