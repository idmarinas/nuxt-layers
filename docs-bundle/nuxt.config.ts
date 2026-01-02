import type { PageMeta } from 'nuxt/app'
import { createResolver } from 'nuxt/kit'

export default defineNuxtConfig({
  modules: ['nuxt-seo-utils'],
  hooks: {
    'pages:resolved'(pages: PageMeta[]) {
      const { resolve } = createResolver(import.meta.url)
      const exclude = ['index', 'lang-index']
      const landingTemplate = resolve('./app/templates/landing.vue')

      pages.map(page => {
        if (exclude.includes(page.name!) && (page.file as string).endsWith('docus/app/templates/landing.vue')) {
          page.file = landingTemplate
        }
      })
    }
  }
})
