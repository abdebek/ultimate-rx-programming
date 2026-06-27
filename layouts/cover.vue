<script setup lang="ts">
import { ref, provide } from 'vue'

const tocOpen = ref(false)
provide('toc-sidebar-open', tocOpen)
</script>

<template>
  <div
    class="slidev-layout cover"
    :class="{ 'with-sidebar': tocOpen }"
  >
    <div class="cover-background"></div>
    <slot />
    <TocSidebar />
  </div>
</template>

<style>
.slidev-layout.cover {
  transition: padding-left 200ms ease;
  position: relative;
  overflow: hidden;
}

.slidev-layout.cover.with-sidebar {
  padding-left: calc(2rem + 18rem + 1px);
}

.cover-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

.slidev-layout.cover > :not(.cover-background) {
  position: relative;
  z-index: 1;
}
</style>

