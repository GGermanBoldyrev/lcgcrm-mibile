<script setup lang="ts">
import { useRouter } from 'vue-router'
import { computed } from 'vue'
import type { QuickAction } from '@/types/quick-actions.ts'

type Props = {
  action: QuickAction
}
const props = defineProps<Props>()
const router = useRouter()

// Основная карта
const color = computed(() => props.action.color ?? 'primary')
const label = computed(() => props.action.label ?? '')
const icon = computed(() => props.action.icon ?? 'mdi-dots-horizontal')

// Вторичная карта
const hasSecondaryCard = computed(() => !!props.action.secondaryCard)
const secondaryColor = computed(() => props.action.secondaryCard?.color ?? 'secondary')
const secondaryIcon = computed(() => props.action.secondaryCard?.icon ?? 'mdi-dots-horizontal')
const secondaryLabel = computed(() => props.action.secondaryCard?.label ?? '')

// Определяем, компактная ли карта (только иконка без текста)
const isCompact = computed(() => !label.value.trim())
const isSecondaryCompact = computed(() => !secondaryLabel.value.trim())

const goToPrimary = () => {
  if (!props.action.to) return
  router.push(props.action.to as any)
}

const goToSecondary = () => {
  if (!props.action.secondaryCard?.to) return
  router.push(props.action.secondaryCard.to as any)
}
</script>

<template>
  <div class="qa-container">
    <!-- Основная карта -->
    <v-card
      class="qa-card rounded-lg pa-5"
      :class="{ 'qa-card--compact': isCompact }"
      elevation="8"
      role="button"
      tabindex="0"
      :aria-label="label || 'Действие'"
      @click="goToPrimary"
      @keyup.enter="goToPrimary"
    >
      <div class="d-flex align-center" :class="{ 'justify-center': isCompact }">
        <v-avatar size="44" :class="{ 'mr-4': !isCompact }" :color="color">
          <v-icon size="26" color="white">{{ icon }}</v-icon>
        </v-avatar>
        <div v-if="label" class="text-subtitle-1 font-weight-600">{{ label }}</div>
      </div>
    </v-card>

    <!-- Вторичная карта -->
    <v-card
      v-if="hasSecondaryCard"
      class="qa-card qa-card--secondary rounded-lg pa-5 ml-3"
      :class="{ 'qa-card--compact': isSecondaryCompact }"
      elevation="8"
      role="button"
      tabindex="0"
      :aria-label="secondaryLabel || 'Дополнительное действие'"
      @click="goToSecondary"
      @keyup.enter="goToSecondary"
    >
      <div class="d-flex align-center" :class="{ 'justify-center': isSecondaryCompact }">
        <v-avatar size="44" :class="{ 'mr-4': !isSecondaryCompact }" :color="secondaryColor">
          <v-icon size="26" color="white">{{ secondaryIcon }}</v-icon>
        </v-avatar>
        <div v-if="secondaryLabel" class="text-subtitle-1 font-weight-600">{{ secondaryLabel }}</div>
      </div>
    </v-card>
  </div>
</template>

<style scoped>
.qa-container {
  display: flex;
  align-items: stretch;
  width: 100%;
}

.qa-card {
  transition: transform .12s ease, box-shadow .12s ease;
  cursor: pointer;
  background-color: rgba(var(--v-theme-surface), 0.96);
  height: 100%;
  display: flex;
  flex: 1;
}

.qa-card--compact {
  flex: 0 0 auto;
}

.qa-card--secondary {
  flex: 0 0 auto;
}

.qa-card:hover, .qa-card:focus-visible {
  transform: translateY(-2px);
  box-shadow: 0 10px 26px rgba(0,0,0,.18);
  outline: none;
}

.font-weight-600 {
  font-weight: 600;
}
</style>
