<script setup lang="ts">
import { computed, ref, onBeforeUnmount, onMounted } from 'vue'
import { useNav } from '@slidev/client/composables/useNav.ts'

const { slides, currentSlideNo, go } = useNav()

const isOpen = ref(false)

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

const lessons = computed(() =>
  slides.value
    .filter((s: any) => s.meta?.slide?.frontmatter?.level)
    .map((s: any) => ({
      no: s.no,
      title: s.meta?.slide?.title ?? `Lesson ${s.no}`,
      level: s.meta?.slide?.frontmatter?.level ?? 1,
    })),
)

const currentLessonNo = computed(() => {
  const current = currentSlideNo.value
  let match: number | null = null
  for (const l of lessons.value) {
    if (l.no <= current) match = l.no
    else break
  }
  return match
})

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && isOpen.value) {
    e.stopPropagation()
    close()
  }
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))
</script>

<template>
  <button
    class="slidev-icon-btn contents-btn"
    title="Table of contents"
    @click="toggle"
  >
    <span class="sr-only">Table of contents</span>
    <div class="i-carbon:list" />
  </button>

  <teleport to="body">
    <transition name="toc-fade">
      <div v-if="isOpen" class="toc-overlay" @click.self="close">
        <nav class="toc-panel" role="navigation" aria-label="Lessons">
          <div class="toc-panel__header">
            <span class="toc-panel__title">Lessons</span>
            <span class="toc-panel__count">{{ lessons.length }}</span>
            <button
              type="button"
              class="toc-panel__close"
              title="Close"
              @click="close"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <ol class="toc-panel__list">
            <li v-for="lesson in lessons" :key="lesson.no" class="toc-panel__item">
              <button
                class="toc-panel__link"
                :class="{ 'toc-panel__link--active': currentLessonNo === lesson.no }"
                @click="navigate(lesson.no)"
              >
                <span class="toc-panel__no">{{ lesson.no }}</span>
                <span class="toc-panel__label">{{ lesson.title }}</span>
              </button>
            </li>
          </ol>
        </nav>
      </div>
    </transition>
  </teleport>
</template>

<style scoped>
.contents-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: var(--slidev-controls-foreground, inherit);
  cursor: pointer;
  transition: background 120ms, opacity 120ms;
  opacity: 0.75;
}
.contents-btn:hover {
  opacity: 1;
}
.contents-btn:focus-visible {
  outline: 2px solid;
  outline-offset: 2px;
}

/* --- Overlay ----------------------------------------- */
.toc-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  justify-content: flex-start;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
}

.toc-panel {
  width: 20rem;
  max-width: 80vw;
  height: 100%;
  background: var(--slidev-main-background, var(--ui-bg, #1a1f2e));
  color: var(--slidev-main-foreground, var(--ui-fg, #e2e8f0));
  border-right: 1px solid var(--slidev-main-border-color, var(--ui-border, #334155));
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.toc-panel__header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1rem 0.75rem;
  border-bottom: 1px solid var(--slidev-main-border-color, var(--ui-border, #334155));
}

.toc-panel__title {
  font-size: 0.8125rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.toc-panel__count {
  font-size: 0.75rem;
  opacity: 0.5;
  margin-right: auto;
}

.toc-panel__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: inherit;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 120ms, background 120ms;
}
.toc-panel__close:hover {
  opacity: 1;
  background: rgba(128, 128, 128, 0.15);
}

.toc-panel__list {
  list-style: none;
  margin: 0;
  padding: 0.5rem 0;
  display: flex;
  flex-direction: column;
}

.toc-panel__item {
  margin: 0;
  padding: 0;
}

.toc-panel__link {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  width: 100%;
  padding: 0.625rem 1rem;
  border: none;
  background: transparent;
  color: inherit;
  opacity: 0.65;
  font-size: 0.875rem;
  text-align: left;
  cursor: pointer;
  transition: background 100ms, opacity 100ms;
}
.toc-panel__link:hover {
  opacity: 1;
  background: rgba(128, 128, 128, 0.12);
}
.toc-panel__link--active {
  opacity: 1;
  font-weight: 600;
  background: color-mix(in srgb, var(--slidev-theme-primary, #3b82f6) 12%, transparent);
}

.toc-panel__no {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 9999px;
  background: rgba(128, 128, 128, 0.2);
  font-size: 0.75rem;
  font-weight: 600;
  flex-shrink: 0;
}
.toc-panel__link--active .toc-panel__no {
  background: var(--slidev-theme-primary, #3b82f6);
  color: #fff;
}

.toc-panel__label {
  line-height: 1.3;
}

/* --- transitions ------------------------------------- */
.toc-fade-enter-active,
.toc-fade-leave-active {
  transition: opacity 180ms ease;
}
.toc-fade-enter-active .toc-panel,
.toc-fade-leave-active .toc-panel {
  transition: transform 180ms ease;
}
.toc-fade-enter-from,
.toc-fade-leave-to {
  opacity: 0;
}
.toc-fade-enter-from .toc-panel,
.toc-fade-leave-to .toc-panel {
  transform: translateX(-100%);
}
</style>