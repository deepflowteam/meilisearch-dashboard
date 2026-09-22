#!/usr/bin/env node
// maplibre-gl-worker.mjs (imported via `?url` in DocumentsAsMap.vue, so Vite copies it verbatim
// without tracing its own imports) does `import ... from './maplibre-gl-shared.mjs'` internally.
// A static `?url` copy only ships the one file, so that sibling never makes it into the
// production build — the worker then fails to load (a silently empty `Worker` error event, no
// tiles ever fetched) while `nuxt dev` masks this entirely because Vite's dev server just serves
// node_modules files on demand. Run this after `nuxt generate`/`nuxt build` to copy the sibling
// alongside the (hashed) worker chunk, under its own literal, unhashed name — that's the exact
// path the worker's relative import expects, regardless of the worker chunk's own hash.
import { copyFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = fileURLToPath(new URL('..', import.meta.url))
const src = path.join(
  root,
  'node_modules/maplibre-gl/dist/maplibre-gl-shared.mjs',
)
const destDir = path.join(root, '.output/public/_nuxt')
const dest = path.join(destDir, 'maplibre-gl-shared.mjs')

if (!existsSync(src)) {
  console.error(`[copy-maplibre-worker-deps] missing source: ${src}`)
  process.exit(1)
}
if (!existsSync(destDir)) {
  console.error(
    `[copy-maplibre-worker-deps] missing ${destDir} — run this after nuxt generate/build.`,
  )
  process.exit(1)
}

copyFileSync(src, dest)
console.log(`[copy-maplibre-worker-deps] copied maplibre-gl-shared.mjs -> ${dest}`)
