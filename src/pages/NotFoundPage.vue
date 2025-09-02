<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <v-main>
    <v-container class="fill-height d-flex align-center justify-center">
      <v-card width="400" class="py-8 px-10 text-center glossy" elevation="8" style="border-radius: var(--radius-lg);">
        <v-card-text class="pa-0">
          <!-- 404 -->
          <h1
            class="error-title"
          >
            404
          </h1>
          <p
            class="error-subtitle"
          >
            Страница не найдена
          </p>

          <v-btn
            color="primary"
            size="large"
            class="mt-6 glossy"
            @click="goHome"
            style="border-radius: var(--radius-md);"

          >
            На главную
          </v-btn>
        </v-card-text>
      </v-card>
    </v-container>
  </v-main>
</template>

<style scoped>
.error-title {
  font-size: 96px;
  font-weight: 700;
  color: rgb(var(--v-theme-primary));
  margin: 0;
}

.error-subtitle {
  font-size: 20px;
  color: rgb(var(--v-theme-medium-emphasis));
  margin-top: 8px;
}
</style>
