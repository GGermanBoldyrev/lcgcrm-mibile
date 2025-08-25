import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// CSS
import './assets/styles/variables.css'
import './assets/styles/glossy-theme.css'

// Pinia
import { useAuthStore } from '@/stores/auth'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { mdi } from 'vuetify/iconsets/mdi'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'


const app = createApp(App)

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    sets: { mdi },
  },
})

app.use(createPinia())
app.use(router)

useAuthStore().restoreFromStorage()

app.use(vuetify).mount('#app')
