<script setup lang="ts">
// Figure animations play for a while after each slide change or click, then pause so an idle slide costs no CPU.
import { watch, onBeforeUnmount, computed } from 'vue'
import { useNav } from '@slidev/client'

const ANIMATE_MS = 15000
const { currentPage, clicks, currentSlideRoute } = useNav()
// Slides with `hideFooter: true` in their frontmatter (welcome, About, the lecture title) show no footer.
const showFooter = computed(() => !currentSlideRoute.value?.meta?.slide?.frontmatter?.hideFooter)
let timer: ReturnType<typeof setTimeout> | undefined

function wake() {
  document.documentElement.classList.remove('anim-idle')
  clearTimeout(timer)
  timer = setTimeout(() => document.documentElement.classList.add('anim-idle'), ANIMATE_MS)
}

watch([currentPage, clicks], wake, { immediate: true })
onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <div class="footer2" v-if="showFooter">
    <span>Lecture 0 · How LLM inference works on a GPU</span>
    <span>{{ currentPage }}</span>
  </div>
</template>

<style>
.anim-idle .slidev-page *, .anim-idle .slidev-page *::before, .anim-idle .slidev-page *::after { animation-play-state: paused !important; }
</style>
