<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// импорт ассета как модуль (Vite)
import logoUrl from '@/assets/images/ui/lcg-logo.png'

const router = useRouter()
const auth = useAuthStore()

const userDisplayName = computed(() => auth.user?.login || 'Пользователь')
const ariaProfile = computed(() => `Профиль: ${userDisplayName.value}`)

const goHome = () => router.push({ name: 'main' })
const goProfile = () => router.push({ name: 'profile' })

const isVisible = ref(false)

onMounted(() => {
  // Небольшая задержка для плавного появления
  setTimeout(() => {
    isVisible.value = true
  }, 100)
})
</script>

<template>
  <v-app-bar 
    v-show="isVisible"
    flat 
    class="top-app-bar glossy"
    v-motion
    :initial="{ 
      opacity: 0,
      y: -20,
      scale: 0.98
    }"
    :enter="{ 
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 25,
        duration: 600
      }
    }"
  >
    <!-- ЛЕВАЯ КНОПКА (лого) -->
    <template #prepend>
      <v-btn 
        variant="text" 
        class="appbar-btn logo-btn" 
        height="100%" 
        @click="goHome"
      >
        <v-img :src="logoUrl" alt="logo" width="135" contain />
      </v-btn>
    </template>

    <!-- ПРАВАЯ КНОПКА (профиль) -->
    <template #append>
      <v-btn variant="text" class="appbar-btn profile-btn" height="100%" :aria-label="ariaProfile" @click="goProfile">
        <v-icon size="28" color="primary" class="mr-2">mdi-account-circle</v-icon>
        <span class="user-login text-subtitle-2">{{ userDisplayName }}</span>
      </v-btn>
    </template>
  </v-app-bar>
</template>

<style scoped>
.top-app-bar {
  border-bottom-left-radius: var(--radius-lg);
  border-bottom-right-radius: var(--radius-lg);
  height: 82px;
  border-bottom: 1px solid rgba(0, 0, 0, .06);
}

/* растягиваем внутренности toolbar на всю высоту */
.top-app-bar :deep(.v-toolbar__content) {
  height: 100% !important;
  padding: 0 8px;
}

/* делаем кнопки высотой в AppBar */
.appbar-btn {
  height: 100%;
  align-self: stretch;
  border-radius: 0;
  padding: 0 10px;
  display: flex;
  align-items: center;
}

.user-login {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 600;
  max-width: 180px;
}

.top-app-bar :deep(.v-btn__overlay) {
  display: none;
}
</style>
