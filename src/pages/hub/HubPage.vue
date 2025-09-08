<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Перенаправляем на страницу поиска
onMounted(() => {
  router.replace({ name: 'Search' })
})
</script>

<template>
  <v-main>
    <v-container>
      <v-row>
        <v-col cols="12" class="text-center py-8">
          <v-progress-circular indeterminate size="64" color="primary" />
          <p class="text-body-1 mt-4 mb-0">Перенаправление...</p>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>
