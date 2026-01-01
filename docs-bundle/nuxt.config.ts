export default defineNuxtConfig({
  modules: ['nuxt-seo-utils'],
  app: {
    baseURL: process.env.NUXT_APP_BASE_URL || '/'
  }
})
