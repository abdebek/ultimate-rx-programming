<script setup lang="ts">
import { useStyleTag } from '@vueuse/core'
import { computed, ref, shallowRef } from 'vue'
import { useDrawings } from '@slidev/client/composables/useDrawings'
import { useHideCursorIdle } from '@slidev/client/composables/useHideCursorIdle'
import { useNav } from '@slidev/client/composables/useNav'
import { useSwipeControls } from '@slidev/client/composables/useSwipeControls'
import { useWakeLock } from '@slidev/client/composables/useWakeLock'
import { useSlideContext } from '@slidev/client'
import Controls from '@slidev/client/internals/Controls.vue'
import LaserPointer from '@slidev/client/internals/LaserPointer.vue'
import NavControls from '@slidev/client/internals/NavControls.vue'
import PresenterMouse from '@slidev/client/internals/PresenterMouse.vue'
import SlideContainer from '@slidev/client/internals/SlideContainer.vue'
import SlidesShow from '@slidev/client/internals/SlidesShow.vue'
import { onContextMenu } from '@slidev/client/logic/contextMenu'
import { registerShortcuts } from '@slidev/client/logic/shortcuts'
import { editorHeight, editorWidth, isEditorVertical, isScreenVertical, showEditor, viewerCssFilter, viewerCssFilterDefaults } from '@slidev/client/state'

const { next, prev, isPrintMode, isPlaying, isEmbedded } = useNav()
const { isDrawing } = useDrawings()
const context = useSlideContext()

const root = ref<HTMLDivElement>()

function onClick(e: MouseEvent) {
  if (showEditor.value)
    return

  if (e.button === 0 && (e.target as HTMLElement)?.id === 'slide-container') {
    if ((e.pageX / window.innerWidth) > 0.5)
      next()
    else
      prev()
  }
}

useSwipeControls(root)
registerShortcuts()
if (__SLIDEV_FEATURE_WAKE_LOCK__)
  useWakeLock()
useHideCursorIdle(computed(() => isPlaying.value && !isEmbedded.value && !showEditor.value))

if (import.meta.hot) {
  useStyleTag(computed(() => showEditor.value
    ? `
    vite-error-overlay {
      --width: calc(100vw - ${isEditorVertical.value ? 0 : editorWidth.value}px);
      --height: calc(100vh - ${isEditorVertical.value ? editorHeight.value : 0}px);
      position: fixed;
      left: 0;
      top: 0;
      width: calc(var(--width) / var(--slidev-slide-scale));
      height: calc(var(--height) / var(--slidev-slide-scale));
      transform-origin: top left;
      transform: scale(var(--slidev-slide-scale));
    }`
    : '',
  ))
}

const persistNav = computed(() => isScreenVertical.value || showEditor.value)

const SideEditor = shallowRef<any>()
if (__DEV__ && __SLIDEV_FEATURE_EDITOR__)
  import('@slidev/client/internals/SideEditor.vue').then(v => SideEditor.value = v.default)

const contentStyle = computed(() => {
  let filter = ''

  if (viewerCssFilter.value.brightness !== viewerCssFilterDefaults.brightness)
    filter += `brightness(${viewerCssFilter.value.brightness}) `
  if (viewerCssFilter.value.contrast !== viewerCssFilterDefaults.contrast)
    filter += `contrast(${viewerCssFilter.value.contrast}) `
  if (viewerCssFilter.value.sepia !== viewerCssFilterDefaults.sepia)
    filter += `sepia(${viewerCssFilter.value.sepia}) `
  if (viewerCssFilter.value.hueRotate !== viewerCssFilterDefaults.hueRotate)
    filter += `hue-rotate(${viewerCssFilter.value.hueRotate}deg) `
  if (viewerCssFilter.value.invert)
    filter += 'invert(1) '

  return {
    filter,
  }
})

const totalSlides = computed(() => context.slides.value.length)
const currentSlide = computed(() => context.currentSlideNo.value)
const isFirstOrLastSlide = computed(() => {
  return currentSlide.value === 1 || currentSlide.value === totalSlides.value
})
</script>

<template>
  <div
    id="page-root" ref="root" class="grid"
    :class="[
      isEditorVertical ? 'grid-rows-[1fr_max-content]' : 'grid-cols-[1fr_max-content]',
      { 'nav-hidden': isFirstOrLastSlide }
    ]"
  >
    <SlideContainer
      :style="{ background: 'var(--slidev-slide-container-background, black)' }"
      is-main
      :content-style="contentStyle"
      @pointerdown="onClick"
      @contextmenu="onContextMenu"
    >
      <template #default>
        <SlidesShow render-context="slide" />
        <PresenterMouse />
        <LaserPointer />
      </template>
      <template #controls>
        <div
          v-if="!isPrintMode"
          class="absolute bottom-0 left-0 transition duration-300 opacity-0 hover:opacity-100 focus-within:opacity-100 focus-visible:opacity-100 nav-always-show"
          :class="[
            persistNav ? '!opacity-100 right-0' : 'opacity-0 p-2',
            isDrawing ? 'pointer-events-none' : '',
          ]"
        >
          <NavControls :persist="persistNav" />
        </div>
      </template>
    </SlideContainer>
    <SideEditor v-if="SideEditor && showEditor" :resize="true" />
  </div>
  <Controls v-if="!isPrintMode" />
  <div id="twoslash-container" />
</template>

<style>
#page-root.nav-hidden :deep(nav) {
  display: none !important;
}

/* Force nav to always show (Slidev sometimes hides it on cover layouts) */
.nav-always-show :deep(nav) {
  display: flex !important;
  visibility: visible !important;
  opacity: 1 !important;
}
</style>
