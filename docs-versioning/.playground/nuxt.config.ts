import {fileURLToPath} from 'node:url'

export default defineNuxtConfig({
  extends: ['docus', '..'],
  modules: ['@nuxt/eslint', '@nuxtjs/i18n'],
  eslint: {
    config: {
      // Use the generated ESLint config for lint root project as well
      rootDir: fileURLToPath(new URL('..', import.meta.url))
    }
  },
  devtools: {enable: true},
  docsVersioning: {
    enable: true,
    github: {
      owner: 'idmarinas',
      repo: 'advertising-bundle'
    }
  },
  i18n: {
    defaultLocale: 'en',
    locales: [{
      code: 'en',
      name: 'English',
    }, {
      code: 'fr',
      name: 'Français',
    }],
  },
})
