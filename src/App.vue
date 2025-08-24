<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'

const route = useRoute()
const Layout = computed(() => (route.meta.layout === 'auth' ? AuthLayout : MainLayout))
</script>

<template>
  <Layout>
    <router-view />
  </Layout>
</template>

<style scoped></style>
