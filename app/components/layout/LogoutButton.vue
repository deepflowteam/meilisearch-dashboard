<template>
  <UButton
    v-tippy="t('label')"
    type="button"
    color="neutral"
    variant="ghost"
    icon="ant-design:logout-outlined"
    :aria-label="t('label')"
    @click="confirmLogout()"
  />
</template>

<script setup lang="ts">
import { useConfirmationDialog } from '~/stores'

const { confirm } = useConfirmationDialog()
const { t } = useI18n()
const confirmLogout = async () => {
  if (await confirm({ text: t('confirmation') })) {
    navigateTo('/logout')
  }
}
</script>

<i18n>
en:
  label: Sign out
  confirmation: Do you really want to log out?
</i18n>
