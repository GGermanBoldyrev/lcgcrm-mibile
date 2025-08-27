<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

// Данные профиля из store или моковые данные по умолчанию
const userProfile = computed(() => ({
  fullName: auth.user?.fullName || 'Фамилия Имя Отчество',
  login: auth.user?.login || 'Нет',
  email: auth.user?.email || 'Нет',
  subdivisionName: auth.user?.subdivisionName || 'Нет',
  additionalInfo: auth.user?.additionalInfo || 'Нет',
  phone: auth.user?.phone || 'Нет'
}))

const handleLogout = () => {
  auth.clearAuth()
  router.push({ name: 'login' })
}

</script>

<template>
  <v-main>
    <v-container>
      <!-- Карточка профиля -->
      <v-row>
        <v-col cols="12" md="8" lg="6">
          <v-card class="profile-card glossy" elevation="8" v-motion :initial="{
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
              <!-- Аватар и основная информация -->
              <div class="d-flex align-center mb-6">
                <v-avatar size="80" color="primary" class="mr-4">
                  <v-icon size="40" color="white">mdi-account</v-icon>
                </v-avatar>
                <div>
                  <h2 class="text-h5 font-weight-bold mb-1">{{ userProfile.fullName }}</h2>
                </div>
              </div>

              <!-- Детали профиля -->
              <v-divider class="mb-6" />

              <div class="profile-details">
                <div class="d-flex align-center mb-4">
                  <v-icon color="primary" class="mr-3">mdi-account-outline</v-icon>
                  <div>
                    <p class="text-caption text-medium-emphasis mb-0">Логин</p>
                    <p class="text-body-1 font-weight-medium">{{ userProfile.login }}</p>
                  </div>
                </div>

                <div class="d-flex align-center mb-4">
                  <v-icon color="primary" class="mr-3">mdi-email-outline</v-icon>
                  <div>
                    <p class="text-caption text-medium-emphasis mb-0">Email</p>
                    <p class="text-body-1 font-weight-medium">{{ userProfile.email }}</p>
                  </div>
                </div>

                <div class="d-flex align-center mb-4">
                  <v-icon color="primary" class="mr-3">mdi-domain</v-icon>
                  <div>
                    <p class="text-caption text-medium-emphasis mb-0">Отделение</p>
                    <p class="text-body-1 font-weight-medium">{{ userProfile.subdivisionName }}</p>
                  </div>
                </div>

                <div class="d-flex align-center mb-4">
                  <v-icon color="primary" class="mr-3">mdi-briefcase-outline</v-icon>
                  <div>
                    <p class="text-caption text-medium-emphasis mb-0">Дополнительная информация</p>
                    <p class="text-body-1 font-weight-medium">{{ userProfile.additionalInfo }}</p>
                  </div>
                </div>

                <div class="d-flex align-center mb-6">
                  <v-icon color="primary" class="mr-3">mdi-phone-outline</v-icon>
                  <div>
                    <p class="text-caption text-medium-emphasis mb-0">Телефон</p>
                    <p class="text-body-1 font-weight-medium">{{ userProfile.phone }}</p>
                  </div>
                </div>
              </div>

              <!-- Кнопка логаута -->
              <v-divider class="mb-6" />

              <v-btn block color="primary" size="large" prepend-icon="mdi-logout" @click="handleLogout"
                class="logout-btn glossy" style="border-radius: var(--radius-md);" v-motion :initial="{
                  opacity: 0
                }" :enter="{
                  opacity: 1,
                  transition: {
                    duration: 400
                  }
                }">
                Выйти
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<style scoped>
.profile-card {
  border-radius: var(--radius-lg);
  border: 1px solid rgba(0, 0, 0, .06);
}

.profile-details {
  max-width: 400px;
}

.logout-btn {
  border-width: 2px;
}

.logout-btn:hover {
  background-color: rgb(var(--v-theme-error));
  color: white;
}
</style>
