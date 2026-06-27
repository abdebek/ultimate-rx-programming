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
    <slot />
    <TocSidebar />
  </div>
</template>

<style>
.slidev-layout.cover {
  transition: padding-left 200ms ease;
}
.slidev-layout.cover.with-sidebar {
  padding-left: calc(2rem + 18rem + 1px);
}
</style>
