<template>
  <main class="grid h-full grid-cols-12 overflow-hidden">
    <div
      class="col-span-3 h-full space-y-6 overflow-x-hidden overflow-y-auto px-4 pb-4"
    >
      <DocumentCard
        v-for="document of documents"
        :indexUid="indexUid"
        :document
        :primary-key="primaryKey"
        :key="document[primaryKey]"
        :id="`document-${document[primaryKey]}`"
        class="w-full"
      />
    </div>
    <div ref="mapContainer" class="col-span-9 size-full" />
  </main>
</template>

<script setup lang="ts">
import {
  Map as MapLibreMap,
  Marker,
  NavigationControl,
  Popup,
  ScaleControl,
} from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import DocumentCard from './DocumentCard.vue'
import { useFields } from '~/composables'
import { AppliedFilters } from '~/utils'

type Props = {
  indexUid: string
  primaryKey: string
  documents: Array<any>
  fields: Array<string>
  appliedFilters: AppliedFilters
  canFilterGeoDocuments: boolean
}

const props = defineProps<Props>()
const { nameField } = useFields(props.primaryKey, props.fields, props.indexUid)

const mapContainer = ref<HTMLElement>()
let map: MapLibreMap | undefined
let markers: Marker[] = []

const colorMode = useColorMode()
const styleUrl = (dark: boolean) =>
  `https://tiles.openfreemap.org/styles/${dark ? 'dark' : 'bright'}`

const scrollToDocument = (doc: any) => {
  document
    .getElementById(`document-${doc[props.primaryKey]}`)
    ?.scrollIntoView({ behavior: 'smooth' })
}

const onMoveEnd = () => {
  if (!map || !props.canFilterGeoDocuments) {
    return
  }
  const bounds = map.getBounds()
  const northEast = bounds.getNorthEast()
  const southWest = bounds.getSouthWest()
  const boundingBox = {
    topLeftCorner: [northEast.lat, northEast.lng] as [number, number],
    bottomRightCorner: [southWest.lat, southWest.lng] as [number, number],
  }
  props.appliedFilters.applyBoundingBox(boundingBox)
}

const createMarkerElement = () => {
  const el = document.createElement('div')
  el.style.width = '32px'
  el.style.height = '32px'
  el.style.cursor = 'pointer'
  el.style.backgroundImage = 'url(/pin.svg)'
  el.style.backgroundSize = 'contain'
  el.style.backgroundRepeat = 'no-repeat'
  return el
}

const renderMarkers = () => {
  if (!map) {
    return
  }
  markers.forEach((marker) => marker.remove())
  markers = props.documents
    .filter((doc) => Object.keys(doc).includes('_geo'))
    .map((doc) => {
      const { lat, lng } = doc._geo
      const popup = new Popup({ offset: 24 }).setText(doc[nameField.value])
      const marker = new Marker({
        element: createMarkerElement(),
        anchor: 'bottom',
      })
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map!)
      marker.getElement().addEventListener('click', () => scrollToDocument(doc))
      return marker
    })
}

onMounted(() => {
  map = new MapLibreMap({
    container: mapContainer.value!,
    style: styleUrl(colorMode.value === 'dark'),
    center: [0, 0],
    zoom: 2,
  })
  map.addControl(new NavigationControl({ showCompass: false }))
  map.addControl(new ScaleControl())
  map.on('load', renderMarkers)
  map.on('moveend', onMoveEnd)
})

onBeforeUnmount(() => {
  markers.forEach((marker) => marker.remove())
  map?.remove()
})

watch(() => props.documents, renderMarkers)
watch(
  () => colorMode.value,
  (value) => map?.setStyle(styleUrl(value === 'dark')),
)
</script>
