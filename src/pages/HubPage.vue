<script setup lang="ts">

</script>

<template>
  <v-main>
    <v-container>
      <!-- Основная карточка -->
      <v-row>
        <v-col cols="12" md="8" lg="6">
          <v-card class="hub-card glossy" elevation="8" v-motion :initial="{
            opacity: 0,
            y: 40,
            scale: 0.9
          }" :enter="{
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
              type: 'spring',
              stiffness: 250,
              damping: 20,
              duration: 500
            }
          }">
            <v-card-text class="pa-6">
              <div class="d-flex align-center mb-6">
                <v-avatar size="80" color="primary" class="mr-4">
                  <v-icon size="40" color="white">mdi-file-document-outline</v-icon>
                </v-avatar>
                <div>
                  <h2 class="text-h5 font-weight-bold mb-1">Канцелярия</h2>
                  <p class="text-body-1 text-medium-emphasis mb-0">Центр управления документами</p>
                </div>
              </div>

              <v-divider class="mb-6" />

              <div class="hub-actions">
                <v-btn block color="primary" size="large" prepend-icon="mdi-file-search" class="mb-4 glossy"
                  style="border-radius: var(--radius-md);" v-motion :initial="{
                    opacity: 0
                  }" :enter="{
                    opacity: 1,
                    transition: {
                      duration: 400
                    }
                  }">
                  Найти реестр
                </v-btn>

                <v-btn block variant="outlined" color="secondary" size="large" prepend-icon="mdi-qrcode-scan"
                  class="glossy" style="border-radius: var(--radius-md);" v-motion :initial="{
                    opacity: 0
                  }" :enter="{
                    opacity: 1,
                    transition: {
                      duration: 400
                    }
                  }">
                  Сканировать QR
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<style scoped>
.hub-card {
  border-radius: var(--radius-lg);
  border: 1px solid rgba(0, 0, 0, .06);
}

.hub-actions {
  max-width: 400px;
}
</style>
