<template>
  <div class="flex items-center gap-1">
    <GithubButton />
    <ThemeSettings />
    <LogoutButton />
  </div>
</template>

<script setup lang="ts">
import GithubButton from '~/components/layout/GithubButton.vue'
import LogoutButton from '~/components/layout/LogoutButton.vue'
import ThemeSettings from '~/components/layout/ThemeSettings.vue'
</script>
