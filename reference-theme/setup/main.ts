// Fit the slide canvas to the window so the deck fills the full screen width (no side bars).
// Slidev reads configs.aspectRatio inside computed(); a getter backed by a ref makes it follow window resizes.
import { defineAppSetup } from '@slidev/types'
import configs from '#slidev/configs'
import { ref } from 'vue'

const MIN_ASPECT = 1.5 // narrower windows letterbox instead of stretching the layouts too tall
const MAX_ASPECT = 2.0 // ultra-wide windows letterbox instead of squashing the layouts

const clamp = (v: number) => Math.min(MAX_ASPECT, Math.max(MIN_ASPECT, v))
const windowAspect = () => clamp(window.innerWidth / Math.max(1, window.innerHeight))

// After a redeploy, an open tab still asks for the previous build's slide files, which no longer exist.
// Reload once to pick up the new build; the hash URL keeps the current slide and click.
const RELOAD_KEY = 'deck-chunk-reload-at'
const RELOAD_GAP_MS = 10000 // never reload more than once in 10 s, so a real outage cannot loop

function reloadForNewBuild() {
  let last = 0
  try { last = Number(sessionStorage.getItem(RELOAD_KEY) || 0) } catch {}
  if (Date.now() - last < RELOAD_GAP_MS) return false
  try { sessionStorage.setItem(RELOAD_KEY, String(Date.now())) } catch {}
  window.location.reload()
  return true
}

const isChunkError = (msg: string) =>
  /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i.test(msg)

export default defineAppSetup(() => {
  if (typeof window === 'undefined') return
  window.addEventListener('vite:preloadError', (event) => {
    if (reloadForNewBuild()) event.preventDefault()
  })
  window.addEventListener('unhandledrejection', (event) => {
    const msg = String(event.reason?.message ?? event.reason ?? '')
    if (isChunkError(msg) && reloadForNewBuild()) event.preventDefault()
  })
  const aspect = ref(windowAspect())
  Object.defineProperty(configs, 'aspectRatio', { get: () => aspect.value, configurable: true })
  window.addEventListener('resize', () => { aspect.value = windowAspect() }, { passive: true })
})
