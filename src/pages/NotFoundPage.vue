<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <v-app>
    <v-main class="bg-auth">
      <v-container class="fill-height d-flex align-center justify-center py-8">
        <v-card width="400" class="rounded-lg py-8 px-10 fade-in text-center" elevation="8">
          <v-card-text class="pa-0">
            <!-- 404 -->
            <h1 class="error-title">404</h1>
            <p class="error-subtitle">Страница не найдена</p>

            <v-btn color="primary" size="large" class="mt-6" @click="goHome">
              На главную
            </v-btn>
          </v-card-text>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped>
.bg-auth {
  min-height: 100vh;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  background-size: cover;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fade-in {
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.error-title {
  font-size: 96px;
  font-weight: 700;
  color: #1976d2; /* твой primary */
  margin: 0;
}

.error-subtitle {
  font-size: 20px;
  color: #555;
  margin-top: 8px;
}
</style>
