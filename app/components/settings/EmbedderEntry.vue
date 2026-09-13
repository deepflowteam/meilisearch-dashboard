<template>
  <div class="grid grid-cols-12 space-x-4">
    <UniqueId v-slot="{ id }" as="div" class="col-span-4 space-y-2">
      <div class="flex flex-col gap-1">
        <Label required :for="id">{{ t('labels.name') }}</Label>
        <input
          v-model="embedder[0]"
          required
          autocomplete="off"
          type="text"
          class="form-input w-full text-sm"
        />
      </div>
      <Button
        type="button"
        size="small"
        theme="primary"
        icon="mdi:bin"
        @click="$emit('remove', embedder[0])"
        class="w-auto"
      >
        {{ t('actions.remove') }}
      </Button>
    </UniqueId>
    <div class="col-span-8 space-y-2">
      <UniqueId v-slot="{ id }" as="section">
        <Label required :for="id">{{ t('labels.source') }}</Label>
        <Select v-model="embedder[1]!.source" required :id class="w-full">
          <option value="openAi">OpenAI</option>
          <option value="huggingFace">HuggingFace</option>
          <option value="ollama">Ollama</option>
          <option value="rest">REST</option>
          <option value="userProvided">User Provided</option>
        </Select>
      </UniqueId>

      <RestEmbedderForm
        v-if="'rest' === embedder[1]!.source"
        v-model="embedder[1] as RestEmbedder"
      />
      <OllamaEmbedderForm
        v-if="'ollama' === embedder[1]!.source"
        v-model="embedder[1] as OllamaEmbedder"
      />
      <OpenAIEmbedderForm
        v-if="'openAi' === embedder[1]!.source"
        v-model="embedder[1] as OpenAiEmbedder"
      />
      <HuggingFaceEmbedderForm
        v-if="'huggingFace' === embedder[1]!.source"
        v-model="embedder[1] as HuggingFaceEmbedder"
      />

      <UniqueId
        v-if="'userProvided' !== embedder[1]!.source"
        v-slot="{ id }"
        as="section"
        class="flex flex-col gap-1"
      >
        <div class="flex items-center justify-between">
          <Label :for="id">{{ t('labels.documentTemplate') }}</Label>
          <Button
            type="button"
            size="small"
            icon="heroicons:eye"
            @click="openPreview()"
          >
            {{ t('actions.preview') }}
          </Button>
        </div>
        <Textarea
          v-model="embedder[1]!.documentTemplate"
          class="w-full text-sm"
          rows="5"
        />
      </UniqueId>
    </div>

    <USlideover v-model:open="previewOpen" :title="t('preview.title')">
      <template #body>
        <div class="space-y-4">
          <Alert v-if="previewError" theme="danger" :title="t('preview.error')">
            {{ previewError }}
          </Alert>
          <template v-else>
            <div class="space-y-1">
              <p class="text-sm font-medium">
                {{ t('preview.sampleDocument') }}
              </p>
              <pre
                class="max-h-40 overflow-auto rounded-md bg-gray-100 p-2 text-xs dark:bg-gray-800"
                >{{ previewSampleDocument }}</pre>
            </div>
            <div class="space-y-1">
              <p class="text-sm font-medium">{{ t('preview.rendered') }}</p>
              <pre
                v-if="!previewLoading"
                class="max-h-60 overflow-auto rounded-md bg-gray-100 p-2 text-xs dark:bg-gray-800"
                >{{ previewRendered }}</pre>
              <p v-else class="text-sm text-gray-500 dark:text-gray-400">
                {{ t('preview.loading') }}
              </p>
            </div>
          </template>
        </div>
      </template>
    </USlideover>
  </div>
</template>

<script setup lang="ts">
import Label from '~/components/layout/forms/Label.vue'
import Button from '~/components/layout/forms/Button.vue'
import type {
  Embedder,
  HuggingFaceEmbedder,
  OllamaEmbedder,
  OpenAiEmbedder,
  RestEmbedder,
} from 'meilisearch'
import Select from '~/components/layout/forms/Select.vue'
import RestEmbedderForm from '~/components/settings/embedder/RestEmbedderForm.vue'
import Textarea from '~/components/layout/forms/Textarea.vue'
import OllamaEmbedderForm from '~/components/settings/embedder/OllamaEmbedderForm.vue'
import OpenAIEmbedderForm from '~/components/settings/embedder/OpenAIEmbedderForm.vue'
import HuggingFaceEmbedderForm from '~/components/settings/embedder/HuggingFaceEmbedderForm.vue'
import Alert from '~/components/layout/Alert.vue'
import { ref } from 'vue'
import { useMeiliClient } from '~/composables'

type Props = {
  embedder: [string, Embedder]
  indexUid: string
}
const props = defineProps<Props>()

const { t } = useI18n()

const previewOpen = ref(false)
const previewLoading = ref(false)
const previewError = ref<string | null>(null)
const previewSampleDocument = ref('')
const previewRendered = ref('')

const openPreview = async () => {
  previewOpen.value = true
  previewLoading.value = true
  previewError.value = null
  previewRendered.value = ''
  previewSampleDocument.value = ''
  try {
    const meili = useMeiliClient()
    const { results } = await meili.index(props.indexUid).getDocuments({
      limit: 1,
    })
    const sampleDocument = results[0]
    if (!sampleDocument) {
      previewError.value = t('preview.noDocuments')
      return
    }
    previewSampleDocument.value = JSON.stringify(sampleDocument, null, 2)
    const { rendered } = await meili.renderTemplate({
      template: {
        kind: 'inlineDocumentTemplate',
        inline: props.embedder[1]!.documentTemplate,
      },
      input: {
        kind: 'inlineDocument',
        inline: sampleDocument,
      },
    })
    previewRendered.value =
      'string' === typeof rendered
        ? rendered
        : JSON.stringify(rendered, null, 2)
  } catch (e) {
    previewError.value = (e as Error).message
  } finally {
    previewLoading.value = false
  }
}
</script>

<i18n>
en:
  labels:
    name: Embedder name
    source: Source
    documentTemplate: Document template
  actions:
    remove: Remove
    preview: Preview
  preview:
    title: Document template preview
    sampleDocument: Sample document used
    rendered: Rendered template
    loading: Rendering...
    error: Could not render the template
    noDocuments: This index has no documents to preview the template with.
</i18n>
