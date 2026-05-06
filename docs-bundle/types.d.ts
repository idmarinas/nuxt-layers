import type { DocsBundleConfig } from './interfaces'

declare module '@nuxt/schema' {
  interface AppConfig {
    docsBundle: DocsBundleConfig
  }
}

export { }
