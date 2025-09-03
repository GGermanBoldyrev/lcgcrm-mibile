<template>
  <Teleport to="body">
    <div v-if="visible" class="floating-action-bar">
      <div class="floating-bar-content glossy">
        <!-- Динамические ряды кнопок -->
        <div
          v-for="(row, rowIndex) in buttonRows"
          :key="rowIndex"
          class="action-row"
        >
          <v-btn
            v-for="(button, buttonIndex) in row"
            :key="buttonIndex"
            v-bind="button.props"
            :class="['glossy', button.class, { 'action-btn': row.length > 1 }]"
            :style="button.style || 'border-radius: var(--radius-md);'"
            @click="emit(button.event, button.payload)"
          >
            {{ button.text }}
          </v-btn>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
interface ButtonConfig {
  text: string
  event: string
  payload?: any
  props?: Record<string, any>
  class?: string
  style?: string
}

interface Props {
  visible: boolean
  buttonRows: ButtonConfig[][]
}

defineProps<Props>()

// Эмиты для Hub компонента
const emit = defineEmits<{
  reset: []
  scanAgain: []
  nextStatus: []
}>()
</script>

<style scoped lang="scss">
.floating-action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 16px;
  pointer-events: none;

    .floating-bar-content {
    max-width: 400px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px;
    pointer-events: auto;
    transform: translateY(-20px); // Поднимаем bar на 20px выше

    // Анимация появления
    animation: slideUp 0.3s ease-out;
  }

  .action-row {
    display: flex;
    gap: 12px;

    .action-btn {
      flex: 1;
    }

    // Кнопки на всю ширину если одна кнопка в ряду
    > .v-btn:only-child {
      width: 100%;
    }

    // Дополнительный padding для кнопок
    :deep(.v-btn) {
      padding-left: 16px !important;
      padding-right: 16px !important;
      min-height: 48px;
    }
  }
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

// Адаптивность
@media (max-width: 600px) {
  .floating-action-bar {
    padding: 12px;

    .floating-bar-content {
      padding: 12px;
      gap: 10px;
    }

    .action-row {
      gap: 8px;
    }
  }
}
</style>
