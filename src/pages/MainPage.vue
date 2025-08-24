
<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import QuickActionCard from '@/components/QuickActionCard.vue'
import type { QuickAction } from '@/types/quick-actions'

const router = useRouter()
const auth = useAuthStore()

const displayName = computed(() => auth.user?.login ?? 'Пользователь')

const quickActions: QuickAction[] = [
  {
    label: 'Канцелярия',
    icon: 'mdi-file-document-outline',
    to: { name: 'hub' },
    secondaryCard: {
      icon: 'mdi-qrcode-scan',
      to: { name: 'scanner' }
    }
  },
]
</script>

<template>
  <v-main class="bg-main">
    <v-container>
      <section aria-label="Быстрые действия">
        <v-row align="stretch" v-memo="[quickActions]">
          <v-col cols="12" v-for="(action, i) in quickActions" :key="`block-${i}`">
            <QuickActionCard :action="action" />
          </v-col>
        </v-row>
      </section>
    </v-container>
  </v-main>
</template>

<style scoped>

</style>
