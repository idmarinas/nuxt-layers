import type {DocsBundleConfig} from './bundle.config'

declare module '@nuxt/schema' {
  interface AppConfig {
    docsBundle: DocsBundleConfig
  }
}

export {}
