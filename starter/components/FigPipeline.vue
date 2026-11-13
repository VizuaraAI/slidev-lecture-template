<script setup lang="ts">
// Memory → cache → core, one box per click, then a value travels along the path, then a definition card.
import { computed } from 'vue'
import { useSlideContext } from '@slidev/client'
const { $clicks } = useSlideContext()
// off: clicks used by an earlier half of a merged slide (0 when the figure has the slide to itself)
const props = withDefaults(defineProps<{ off?: number }>(), { off: 0 })
const ck = computed(() => $clicks.value - props.off)
const s = (n: number) => ck.value >= n

const boxes = [
  { at: 0, x: 60,  title: 'Main memory', sub: '16 GB · ~100 ns a read', fill: '#e0e7ff', ink: '#3730a3' },
  { at: 1, x: 400, title: 'Cache',       sub: 'a few MB · ~1 ns a read', fill: '#ccfbf1', ink: '#115e59' },
  { at: 2, x: 740, title: 'Core',        sub: 'does the arithmetic',     fill: '#0f172a', ink: '#ffffff' },
]
const BW = 200, BY = 110, BH = 96
// one path for both the drawn line and the moving dot, so the dot always sits on the line
const track = `M ${60 + BW} ${BY + BH / 2} L ${740} ${BY + BH / 2}`
</script>

<template>
  <svg class="fx" viewBox="0 0 1000 400" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="fp-sh" x="-20%" y="-30%" width="140%" height="170%">
        <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#0f172a" flood-opacity=".16"/>
      </filter>
    </defs>

    <!-- order: line, then the dot that rides it, then the boxes on top -->
    <path :d="track" :class="s(1) ? 'show' : 'hide'" stroke="#a5b4fc" stroke-width="3" stroke-dasharray="3 7" stroke-linecap="round" fill="none"/>
    <circle v-if="s(3)" r="7" fill="#4f46e5" class="fp-dot" :style="{ offsetPath: `path('${track}')` }"/>

    <g v-for="b in boxes" :key="b.title" :class="s(b.at) ? 'show' : 'hide'">
      <g filter="url(#fp-sh)"><rect :x="b.x" :y="BY" :width="BW" :height="BH" rx="18" :fill="b.fill"/></g>
      <text :x="b.x + BW / 2" :y="BY + 44" text-anchor="middle" class="t-lbl" :style="{ fill: b.ink, fontSize: '19px' }">{{ b.title }}</text>
      <text :x="b.x + BW / 2" :y="BY + 68" text-anchor="middle" class="t-sm" :style="{ fill: b.at === 2 ? '#c7d2fe' : '#475569' }">{{ b.sub }}</text>
    </g>

    <!-- definition card on the last click -->
    <g :class="s(4) ? 'show' : 'hide'">
      <rect x="60" y="270" width="880" height="84" rx="16" fill="#fffbeb"/>
      <text x="84" y="302" class="t-lbl" style="fill:#b45309">Cache</text>
      <text x="84" y="328" class="t-sm">A small, fast copy of recently used data, kept on the CPU chip next to the core.</text>
    </g>
  </svg>
</template>

<style scoped>
.fp-dot { animation: fp-flow 2.4s linear infinite; }
@keyframes fp-flow {
  0%   { offset-distance: 0%;   opacity: 0; }
  10%  { opacity: 1; }
  90%  { opacity: 1; }
  100% { offset-distance: 100%; opacity: 0; }
}
</style>
