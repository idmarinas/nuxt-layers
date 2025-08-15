// https://nuxt.com/docs/api/configuration/nuxt-config

import {createResolver} from '@nuxt/kit'

const {resolve} = createResolver(import.meta.url)

export default defineNuxtConfig({
  modules: [resolve('./module')],
  i18n: {
    strategy: 'no_prefix'
  },
  compatibilityDate: '2025-08-11',
  devtools: {enabled: true},
  docsVersioning: {
    versions: {
      github: {
        owner: 'idmarinas',
        repo: 'advertising-bundle'
      }
    }
  },
})
