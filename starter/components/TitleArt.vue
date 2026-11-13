<script setup lang="ts">
// Three stacked boxes with a value flowing down through them, on a loop.
const boxes = [
  { y: 60,  t: 'Main memory', c: '#4f46e5' },
  { y: 200, t: 'Cache',       c: '#0d9488' },
  { y: 340, t: 'Core',        c: '#0f172a' },
]
const track = 'M 200 90 L 200 370'
</script>

<template>
  <svg viewBox="0 0 400 440" xmlns="http://www.w3.org/2000/svg">
    <path :d="track" stroke="#a5b4fc" stroke-width="3" stroke-dasharray="3 7" stroke-linecap="round" fill="none"/>
    <circle r="6" fill="#4f46e5" class="ta-dot"/>
    <g v-for="b in boxes" :key="b.t">
      <rect x="70" :y="b.y" width="260" height="60" rx="16" :fill="b.c"/>
      <text x="200" :y="b.y + 36" text-anchor="middle" class="ta-t">{{ b.t }}</text>
    </g>
  </svg>
</template>

<style scoped>
.ta-t { font-family: "Plus Jakarta Sans", sans-serif; font-size: 17px; font-weight: 800; fill: #fff; }
/* the dot rides the dotted track and passes behind the boxes */
.ta-dot { offset-path: path('M 200 90 L 200 370'); offset-rotate: 0deg; animation: ta-flow 3s linear infinite; }
@keyframes ta-flow { to { offset-distance: 100%; } }
</style>
