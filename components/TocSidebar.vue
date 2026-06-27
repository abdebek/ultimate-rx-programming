<script setup lang="ts">
import { ref, computed, inject, watch, onMounted, onBeforeUnmount } from 'vue'
import { useNav, useIsSlideActive, onSlideEnter } from '@slidev/client'

const { slides, currentPage, total, go } = useNav()

const isOpen = inject('toc-sidebar-open', ref(false))

const isSlideActive = useIsSlideActive()

const isDelayedVisible = ref(false)
let enterTimer: ReturnType<typeof setTimeout>

onSlideEnter(() => {
  clearTimeout(enterTimer)
  isDelayedVisible.value = false
  enterTimer = setTimeout(() => {
    isDelayedVisible.value = true
  }, 450)
})

watch(isSlideActive, (active) => {
  if (!active) {
    isDelayedVisible.value = false
    clearTimeout(enterTimer)
  }
})

const isHidden = computed(() =>
  !isSlideActive.value
    || !isDelayedVisible.value
    || currentPage.value === 1
    || currentPage.value === total.value,
)

watch(currentPage, () => {
  isOpen.value = false
})

const lessonSlides = computed(() => {
  return slides.value
    .filter((s: any) => s.meta?.slide?.frontmatter?.level)
    .map((s: any) => ({
      no: s.no,
      title: s.meta?.slide?.title ?? `Lesson ${s.no}`,
    }))
})

function toggle() {
  isOpen.value = !isOpen.value
}

function close() {
  isOpen.value = false
}

function navigate(no: number) {
  go(no)
  close()
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') close()
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  clearTimeout(enterTimer)
})
</script>

<template>
  <div class="toc-sidebar" :class="{ 'toc-sidebar--open': isOpen }">
    <div
      v-if="isOpen"
      class="toc-sidebar__backdrop"
      role="presentation"
      @click="close"
    />

    <button
      class="toc-sidebar__toggle"
      :class="{ 'toc-sidebar__toggle--hidden': isHidden }"
      :aria-label="isOpen ? 'Close lesson navigation' : 'Open lesson navigation'"
      :title="isOpen ? 'Close navigation' : 'Lessons'"
      @click="toggle"
    >
      <svg
        v-if="!isOpen"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
      <svg
        v-else
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>

    <aside
      class="toc-sidebar__panel"
      role="navigation"
      :aria-label="`Lesson navigation (${lessonSlides.length} lessons)`"
    >
      <div class="toc-sidebar__header">
        <span class="toc-sidebar__title">Lessons</span>
        <span class="toc-sidebar__count">{{ lessonSlides.length }}</span>
      </div>
      <ol class="toc-sidebar__list">
        <li
          v-for="lesson in lessonSlides"
          :key="lesson.no"
          class="toc-sidebar__item"
        >
          <button
            class="toc-sidebar__link"
            :class="{ 'toc-sidebar__link--active': currentPage === lesson.no }"
            @click="navigate(lesson.no)"
          >
            <span class="toc-sidebar__no">{{ lesson.no }}</span>
            <span class="toc-sidebar__label">{{ lesson.title }}</span>
          </button>
        </li>
      </ol>
    </aside>
  </div>
</template>

<style scoped>
.toc-sidebar {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 100;
}

.toc-sidebar--open {
  pointer-events: auto;
}

.toc-sidebar__backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
}

.toc-sidebar__toggle {
  position: fixed;
  top: 0.75rem;
  left: 0.75rem;
  pointer-events: auto;
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  border: 1px solid var(--ui-border);
  background: var(--ui-bg);
  color: var(--ui-fg);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
  transition: background 120ms, border-color 120ms, opacity 200ms ease;
  z-index: 101;
}

.toc-sidebar__toggle--hidden {
  opacity: 0;
  pointer-events: none;
}

.toc-sidebar__toggle:hover,
.toc-sidebar__toggle:focus-visible {
  border-color: var(--ui-focus);
  outline: none;
}

.toc-sidebar__panel {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 18rem;
  max-width: 80vw;
  background: var(--ui-bg);
  color: var(--ui-fg);
  border-right: 1px solid var(--ui-border);
  transform: translateX(-100%);
  transition: transform 200ms ease;
  display: flex;
  flex-direction: column;
  z-index: 102;
  overflow-y: auto;
}

.toc-sidebar--open .toc-sidebar__panel {
  transform: translateX(0);
}

.toc-sidebar__header {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  padding: 1rem 1rem 0.5rem;
  border-bottom: 1px solid var(--ui-border);
}

.toc-sidebar__title {
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.toc-sidebar__count {
  font-size: 0.75rem;
  color: var(--ui-muted);
}

.toc-sidebar__list {
  list-style: none;
  margin: 0;
  padding: 0.5rem 0;
  display: flex;
  flex-direction: column;
}

.toc-sidebar__item {
  margin: 0;
  padding: 0;
}

.toc-sidebar__link {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  width: 100%;
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  color: var(--ui-muted);
  font-size: 0.8125rem;
  text-align: left;
  cursor: pointer;
  transition: background 100ms, color 100ms;
}

.toc-sidebar__link:hover {
  background: color-mix(in srgb, var(--ui-focus) 8%, var(--ui-bg));
  color: var(--ui-fg);
}

.toc-sidebar__link--active {
  color: var(--ui-focus);
  font-weight: 600;
  background: color-mix(in srgb, var(--ui-focus) 6%, var(--ui-bg));
}

.toc-sidebar__no {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--ui-border) 40%, transparent);
  font-size: 0.6875rem;
  font-weight: 600;
  flex-shrink: 0;
}

.toc-sidebar__link--active .toc-sidebar__no {
  background: var(--ui-focus);
  color: #fff;
}

.toc-sidebar__label {
  line-height: 1.3;
}
</style>
