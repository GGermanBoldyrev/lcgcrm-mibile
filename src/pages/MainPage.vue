<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

// Имя пользователя для приветствия (падаем в логин, если стора нет/пустая)
const displayName = computed(() => auth.user?.login ?? 'Пользователь')

// Конфигурация быстрых действий
type QuickAction = { label: string; icon: string; to: { name: string } | string; color?: string }
const quickActions: QuickAction[] = [
  { label: 'Канцелярия', icon: 'mdi-file-document-outline', to: { name: 'hub' }, color: 'primary' },
  { label: 'Сканер', icon: 'mdi-qrcode-scan', to: '/scanner', color: 'secondary' },
]

// Навигация по клику
const go = (to: QuickAction['to']) => {
  typeof to === 'string' ? router.push(to) : router.push(to)
}
</script>

<template>
  <v-main class="bg-main">
    <v-container class="py-6">
      <!-- Быстрые действия (mobile-first: по одному в ряд; на планшете по два; на десктопе по три) -->
      <section>
        <v-row dense>
          <v-col
            v-for="(action, i) in quickActions"
            :key="i"
            cols="12" sm="6" md="4"
          >
            <v-card
              class="qa-card rounded-lg px-4 py-5"
              elevation="8"
              role="button"
              tabindex="0"
              @click="go(action.to)"
              @keyup.enter="go(action.to)"
            >
              <div class="d-flex align-center">
                <v-avatar size="44" class="mr-4" :color="action.color ?? 'primary'">
                  <v-icon size="26" color="white">{{ action.icon }}</v-icon>
                </v-avatar>
                <div class="text-subtitle-1 font-weight-600">{{ action.label }}</div>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </section>
    </v-container>
  </v-main>
</template>

<style scoped>
/* Ховер/фокус на карточках действий — понятно, что это кнопки */
.qa-card {
  transition: transform .12s ease, box-shadow .12s ease;
  cursor: pointer;
  background-color: rgba(var(--v-theme-surface), 0.96);
}
.qa-card:hover, .qa-card:focus-visible {
  transform: translateY(-2px);
  box-shadow: 0 10px 26px rgba(0,0,0,.18);
  outline: none;
}

/* Статистические карточки — полупрозрачные на фоне */
.stat-card {
  background-color: rgba(255,255,255,.9);
}

/* Небольшая типографика */
.font-weight-600 { font-weight: 600; }
.font-weight-700 { font-weight: 700; }
</style>
