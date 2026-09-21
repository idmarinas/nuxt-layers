export default defineNuxtConfig({
  modules: ['nuxt-seo-utils'],
  mdc: {
    highlight: {
      langs: ['php', 'twig']
    }
  },
  ui: {
    theme: {
      colors: [
        'primary',
        'secondary',
        'yellow',
        'info',
        'success',
        'warning',
        'error',
        'wip',
        'beta',
        'experimental',
        'deprecated'
      ]
    }
  }
})
