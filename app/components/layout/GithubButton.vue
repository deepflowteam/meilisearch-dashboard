<template>
  <UButton
    v-tippy="t('label')"
    to="https://github.com/deepflowteam/meilisearch-dashboard"
    target="github"
    color="neutral"
    variant="ghost"
    icon="bi:github"
    :aria-label="t('label')"
  />
</template>

<script setup>
const { t } = useI18n()
</script>

<i18n>
en:
  label: Contribute
</i18n>
