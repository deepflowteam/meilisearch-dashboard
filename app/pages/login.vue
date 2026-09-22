<template>
  <div class="bg-bubbles flex h-dvh flex-col items-center justify-center gap-6">
    <div
      class="-mt-20 w-full max-w-lg space-y-6 rounded-lg border-gray-200 bg-white/90 px-6 py-4 md:w-1/2 md:border md:px-0 md:shadow-lg dark:border-gray-800 dark:bg-gray-900/90"
    >
      <NuxtLink to="/indexes" class="flex items-center justify-center gap-2">
        <img
          class="-ml-10 size-16 shrink-0 grow-0"
          src="~/assets/images/logo.svg"
          alt="Meilisearch Dashboard"
        />
        <span class="text-3xl font-semibold">Meilisearch Dashboard</span>
      </NuxtLink>

      <form class="space-y-4 p-4" @submit.prevent="submit(credentials)">
        <h1 class="text-lg font-semibold">
          {{ t('boxTitle') }}
        </h1>

        <Alert v-if="error" dismissable theme="danger" @close="error = null">
          {{ error }}
        </Alert>

        <UniqueId as="section" v-slot="{ id }" class="flex flex-col gap-1">
          <label :for="id">{{ t('labels.instanceUrl') }}</label>
          <input
            v-focus
            v-model="credentials.baseUri"
            required
            type="url"
            class="form-input"
            :placeholder="DEFAULT_BASE_URI"
            @keydown.tab="autofillBaseUri()"
          />
        </UniqueId>

        <UniqueId as="section" v-slot="{ id }" class="flex flex-col gap-1">
          <label :for="id">{{ t('labels.accessToken') }}</label>
          <input
            v-model="credentials.accessKey"
            type="password"
            class="form-input"
          />
        </UniqueId>

        <UniqueId as="section" v-slot="{ id }" class="flex flex-col gap-1">
          <label :for="id">{{ t('labels.instanceName') }}</label>
          <input
            v-model="credentials.name"
            type="text"
            class="form-input"
            :placeholder="suggestedName"
            @keydown.tab="autofillName()"
          />
        </UniqueId>

        <Button
          type="submit"
          icon="solar:login-linear"
          :loading="loading"
          class="w-full"
        >
          <span>{{ t('labels.submit') }}</span>
        </Button>
      </form>
    </div>
    <GithubButton />
  </div>
</template>

<script setup lang="ts">
import { Meilisearch } from 'meilisearch'
import semver from 'semver/preload'
import { TASKS_STREAM_MIN_VERSION, useCredentials, useToasts } from '~/stores'
import { useFormSubmit } from '~/composables'
import Alert from '~/components/layout/Alert.vue'
import Button from '~/components/layout/forms/Button.vue'
import { toRefs } from 'vue'
import GithubButton from '~/components/layout/GithubButton.vue'

definePageMeta({ layout: 'blank' })

const { auth, factory } = useCredentials()
const { createToast } = useToasts()
const { loading, error, handle } = useFormSubmit()
const credentials = ref(factory())
const self: any = reactive({
  credentials,
  error,
  suggestedName: computed(() =>
    '' === self.credentials.baseUri ||
    self.credentials.baseUri?.indexOf('localhost') > -1
      ? t('placeholders.localInstance')
      : t('placeholders.productionInstance'),
  ),
})

const DEFAULT_BASE_URI = 'http://localhost:7700'
const autofillBaseUri = () => {
  if ('' === self.credentials.baseUri) {
    self.credentials.baseUri = DEFAULT_BASE_URI
  }
}

const autofillName = () => {
  if ('' === self.credentials.name) {
    self.credentials.name = self.suggestedName
  }
}

// Live task updates (the sidebar / tasks page's SSE stream, see stores/task-stream.ts) need
// `>= 1.52` and the `tasksStreamingRoute` experimental feature turned on. Checked once per
// connect rather than on every app boot: it's one extra request beyond `getVersion` (already
// made to validate the credentials), and failures here are never fatal to logging in — an
// instance too old for this doesn't expose `/experimental-features` at all, and a scoped key
// without the `experimental.update` action can read but not toggle it. Either way the app
// already falls back to polling on its own (task-stream.ts's own try/catch), so this only ever
// upgrades the experience, never blocks it.
const ensureTasksStreamEnabled = async (
  meili: Meilisearch,
  version: { pkgVersion: string },
) => {
  if (
    !semver.satisfies(version.pkgVersion, TASKS_STREAM_MIN_VERSION, {
      includePrerelease: true,
    })
  ) {
    createToast({
      title: t('toasts.tasksStreamUnsupported.title'),
      text: t('toasts.tasksStreamUnsupported.text', {
        version: version.pkgVersion,
        minVersion: TASKS_STREAM_MIN_VERSION.replace(/^>=/, ''),
      }),
      ttl: 10000,
      icon: 'heroicons:information-circle',
      iconClasses: 'text-blue-500',
    })
    return
  }

  try {
    const features = await meili.getExperimentalFeatures()
    if (!features.tasksStreamingRoute) {
      await meili.updateExperimentalFeatures({ tasksStreamingRoute: true })
      createToast({
        title: t('toasts.tasksStreamEnabled.title'),
        text: t('toasts.tasksStreamEnabled.text'),
        ttl: 5000,
        icon: 'lets-icons:check-fill',
        iconClasses: 'text-green-600',
      })
    }
  } catch {
    // No permission to read/toggle it (a scoped key), or the instance doesn't expose the
    // endpoint despite reporting a recent version — nothing to surface, polling still works.
  }
}

const submit = async (credentials: CredentialsRecord) => {
  const meili = new Meilisearch({
    host: credentials.baseUri,
    apiKey: credentials.accessKey,
  })

  let version
  try {
    version = await handle(() => meili.getVersion(), true)
    auth(credentials)
    navigateTo('/indexes')
  } catch (e) {
    self.error = (e as Error).message
    return
  }
  self.credentials = factory()
  if (version) {
    ensureTasksStreamEnabled(meili, version)
  }
}
const { t } = useI18n()
const { suggestedName } = toRefs(self)

useHead({
  title: t('title'),
})
</script>

<i18n>
en:
  title: Connect
  boxTitle: Connect to your Meilisearch Instance
  labels:
    instanceUrl: "Instance URL:"
    accessToken: "Access Token:"
    instanceName: "Instance Name (optional):"
    submit: "Connect"
  placeholders:
    localInstance: "Local instance"
    productionInstance: "Production"
  toasts:
    tasksStreamUnsupported:
      title: Live task updates unavailable
      text: 'This instance runs Meilisearch {version}. Live task updates over SSE need {minVersion} or later — falling back to polling.'
    tasksStreamEnabled:
      title: Live task updates enabled
      text: Turned on the tasksStreamingRoute experimental feature for live task updates over SSE.
</i18n>

<style>
.bg-bubbles {
  background-image: url('/assets/images/bubbles.svg');
}
</style>
