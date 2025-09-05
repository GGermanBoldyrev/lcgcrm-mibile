<template>
  <div v-if="hasPhotos()" class="photos-section mt-6">
    <div class="d-flex align-center mb-4">
      <v-icon color="primary" class="mr-3" size="24">mdi-camera</v-icon>
      <div>
        <p class="text-caption text-medium-emphasis mb-0 user-select-none">Фотографии</p>
        <p class="text-body-2 font-weight-medium user-select-none">{{ getPhotosCount() }} фото</p>
      </div>
    </div>

    <div class="photos-grid">
      <div
        v-for="(copy, index) in copies"
        :key="`copy-${index}`"
        class="photo-item"
        @click="openFullscreen(index)"
      >
        <!-- Показываем изображение если загружено -->
        <v-img
          v-if="getImageSrc(copy.url)"
          :src="getImageSrc(copy.url)"
          :alt="`Фото ${index + 1}`"
          cover
          class="photo-image"
        />

        <!-- Показываем лоадер если загружается -->
        <div
          v-else-if="isImageLoading(copy.url)"
          class="photo-placeholder loading"
        >
          <v-progress-circular
            color="primary"
            indeterminate
            size="32"
          ></v-progress-circular>
        </div>

        <!-- Показываем ошибку если не удалось загрузить -->
        <div
          v-else-if="isImageError(copy.url)"
          class="photo-placeholder error"
        >
          <v-icon color="error" size="32">mdi-image-broken</v-icon>
          <p class="text-caption mt-2">Ошибка загрузки</p>
        </div>

        <!-- Placeholder пока ничего не происходит -->
        <div
          v-else
          class="photo-placeholder"
        >
          <v-icon color="grey" size="32">mdi-image</v-icon>
        </div>
      </div>
    </div>

    <!-- Fullscreen Dialog -->
    <v-dialog
      v-model="showFullscreen"
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
      class="photo-fullscreen-dialog"
    >
      <v-card class="photo-fullscreen-card">
        <!-- Header with close button -->
        <v-toolbar class="photo-toolbar" color="rgba(0,0,0,0.7)" theme="dark">
          <v-btn icon @click="closeFullscreen" size="large">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>
            Фото {{ getCurrentPhotoNumber() }} из {{ getPhotosCount() }}
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon @click="downloadImage" size="large" v-if="getCurrentImageSrc()">
            <v-icon>mdi-download</v-icon>
          </v-btn>
        </v-toolbar>

        <!-- Image container -->
        <div class="photo-fullscreen-container" @click="closeFullscreen">
          <div class="photo-fullscreen-content" @click.stop>
            <v-img
              v-if="getCurrentImageSrc()"
              :src="getCurrentImageSrc()"
              :alt="`Фото ${currentPhotoIndex + 1}`"
              contain
              class="photo-fullscreen-image"
            />
            <div v-else class="photo-fullscreen-loading">
              <v-progress-circular
                color="white"
                indeterminate
                size="64"
              ></v-progress-circular>
            </div>
          </div>

          <!-- Navigation arrows -->
          <v-btn
            v-if="hasNavigation()"
            icon
            size="large"
            class="photo-nav-btn photo-nav-prev"
            @click.stop="previousPhoto"
            :disabled="!canGoPrevious()"
          >
            <v-icon size="32">mdi-chevron-left</v-icon>
          </v-btn>

          <v-btn
            v-if="hasNavigation()"
            icon
            size="large"
            class="photo-nav-btn photo-nav-next"
            @click.stop="nextPhoto"
            :disabled="!canGoNext()"
          >
            <v-icon size="32">mdi-chevron-right</v-icon>
          </v-btn>
        </div>

        <!-- Bottom indicators -->
        <div v-if="hasNavigation()" class="photo-indicators">
          <div class="d-flex justify-center">
            <v-btn
              v-for="(_, index) in copies"
              :key="`indicator-${index}`"
              :color="index === currentPhotoIndex ? 'white' : 'grey'"
              size="x-small"
              variant="text"
              icon
              @click="goToPhoto(index)"
              class="mx-1"
            >
              <v-icon size="8">mdi-circle</v-icon>
            </v-btn>
          </div>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import type { DocumentCopy } from '@/types/hub'
import { useDocumentPhotoGallery } from '@/composables/hub/useDocumentPhotoGallery'

interface Props {
  copies: DocumentCopy[] | null
}

const props = defineProps<Props>()

// Используем composable для всей логики
const {
  showFullscreen,
  currentPhotoIndex,
  getImageSrc,
  isImageLoading,
  isImageError,
  openFullscreen,
  closeFullscreen,
  nextPhoto,
  previousPhoto,
  goToPhoto,
  getCurrentImageSrc,
  downloadImage,
  hasNavigation,
  canGoPrevious,
  canGoNext,
  getPhotosCount,
  getCurrentPhotoNumber,
  hasPhotos
} = useDocumentPhotoGallery(props.copies)
</script>

<style scoped>
.photos-section {
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  padding-top: 24px;
}

.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
}

.photo-item {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
}

.photo-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.photo-image {
  width: 100%;
  height: 120px;
  border-radius: 12px;
}

.photo-image:deep(.v-img__img) {
  transition: transform 0.3s ease;
}

.photo-item:hover .photo-image:deep(.v-img__img) {
  transform: scale(1.05);
}

.photo-placeholder {
  width: 100%;
  height: 120px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(var(--v-theme-surface-variant), 0.1);
  border: 2px dashed rgba(var(--v-border-color), 0.3);
  text-align: center;
}

.photo-placeholder.loading {
  background: rgba(var(--v-theme-primary), 0.05);
  border-color: rgba(var(--v-theme-primary), 0.2);
}

.photo-placeholder.error {
  background: rgba(var(--v-theme-error), 0.05);
  border-color: rgba(var(--v-theme-error), 0.2);
}

/* Fullscreen styles */
.photo-fullscreen-dialog :deep(.v-overlay__content) {
  max-height: 100vh !important;
  max-width: 100vw !important;
  margin: 0 !important;
}

.photo-fullscreen-card {
  height: 100vh;
  width: 100vw;
  background: black;
  border-radius: 0;
  display: flex;
  flex-direction: column;
}

.photo-toolbar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 2;
  backdrop-filter: blur(10px);
}

.photo-fullscreen-container {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: black;
}

.photo-fullscreen-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.photo-fullscreen-image {
  max-width: 100vw;
  max-height: 100vh;
  width: auto;
  height: auto;
}

.photo-fullscreen-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.photo-nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.5) !important;
  color: white !important;
  backdrop-filter: blur(10px);
}

.photo-nav-prev {
  left: 20px;
}

.photo-nav-next {
  right: 20px;
}

.photo-indicators {
  position: absolute;
  bottom: 20px;
  left: 0;
  right: 0;
  z-index: 2;
}

/* Responsive для мобильных устройств */
@media (max-width: 600px) {
  .photos-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 8px;
  }

  .photo-image,
  .photo-placeholder {
    height: 100px;
  }

  .photo-nav-btn {
    display: none;
  }
}

/* Keyboard navigation */
@media (hover: hover) {
  .photo-nav-btn:hover {
    background: rgba(0, 0, 0, 0.7) !important;
  }
}
</style>
