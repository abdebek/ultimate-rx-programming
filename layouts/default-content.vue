<script setup lang="ts">
import { ref, provide } from 'vue'

const tocOpen = ref(false)
provide('toc-sidebar-open', tocOpen)
</script>

<template>
  <div
    class="slidev-layout default px-8"
    :class="{ 'with-sidebar': tocOpen }"
  >
    <div class="content-glow"></div>
    <slot />
    <TocSidebar />
  </div>
</template>

<style>
.slidev-layout.default {
  transition: padding-left 200ms ease;
  position: relative;
}
.slidev-layout.default.with-sidebar {
  padding-left: calc(2rem + 18rem + 1px);
}

.content-glow {
  position: fixed;
  top: -50%;
  right: -10%;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
}

.slidev-layout.default > :not(.content-glow) {
  position: relative;
  z-index: 1;
}
</style>
