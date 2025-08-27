<script setup lang="ts">
import { useRouter } from 'vue-router'
import QuickActionCard from '@/components/common/QuickActionCard.vue'
import type { QuickAction } from '@/types/quick-actions'

const router = useRouter()

const openQrScanner = async () => {
  // Переходим на Hub страницу и открываем QR-сканер
  await router.push({ name: 'hub', query: { openQR: 'true' } })
}

const quickActions: QuickAction[] = [
  {
    label: 'Канцелярия',
    icon: 'mdi-file-document-outline',
    to: { name: 'hub' },
    secondaryCard: {
      icon: 'mdi-qrcode-scan',
      onClick: openQrScanner
    }
  },

]
</script>

<template>
  <v-main>
    <v-container>
      <!-- Быстрые действия -->
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
/* Стили уже определены в QuickActionCard */
</style>
