import type {Version} from './src/utils/version'

export default defineAppConfig({})

declare module '@nuxt/schema' {
  interface AppConfigInput {
    docsVersioning?: {
      enable?: boolean,
      versions?: Version[]
    }
  }
}
