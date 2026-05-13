export default defineNuxtConfig({
  modules: ['nuxt-seo-utils'],
  mdc: {
    highlight: {
      langs: ['php']
    }
  },
  ogImage: {
    zeroRuntime: true  // elimina todo el código de generación en runtime
  },
  nitro: {
    prerender: {
      crawlLinks: true, // que rastree y pre-renderice todas las páginas
    }
  }
})
