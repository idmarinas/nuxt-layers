import type {Version} from './src/utils/version'
import {
  addComponentsDir,
  addImportsDir,
  addRouteMiddleware,
  addTemplate,
  createResolver,
  defineNuxtModule,
  extendPages
} from '@nuxt/kit'
import githubVersions from './src/utils/githubVersions'
import {PageMeta} from 'nuxt/app'

export interface ModuleOptions {
  enable?: boolean,
  versions?: {
    static?: Version[],
    github?: {
      owner: string,
      repo: string
    }
  }
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'docs-versioning',
    configKey: 'docsVersioning',
  },
  // Default configuration options of the Nuxt module
  defaults: {
    enable: false,
    versions: {
      static: undefined,
      github: undefined
    }
  },
  setup: async function (options: ModuleOptions, nuxt) {
    const opts = options?.versions
    nuxt.options.appConfig.docsVersioning = {
      enable: options.enable,
      versions: []
    }

    if (!options.enable) {
      return
    }

    if (opts?.static !== undefined && opts.static.length > 0) {
      nuxt.options.appConfig.docsVersioning.versions = opts.static
    } else if (opts?.github?.owner !== undefined && opts?.github?.repo !== undefined) {
      nuxt.options.appConfig.docsVersioning.versions = await githubVersions(opts.github.owner, opts.github.repo)
    }

    const {resolve} = createResolver(import.meta.url)
    addComponentsDir({
      path: resolve('./src/components'),
      priority: 10
    })

    addRouteMiddleware({
      path: resolve('./src/middleware/00.setup.global'),
      name: '00.setup.global',
      global: true
    })

    extendPages(pages => {
      pages.push({
        name: 'v-lang-slug',
        path: '/:v(current|\\d+\.x)?/:lang(\\w{2})?/:slug(.*)*',
        file: resolve('./src/pages/[v]/[lang]/[...slug].vue')
      })
      pages.push({
        name: 'v-lang-index',
        path: '/:v(current|\\d+\.x)?/:lang(\\w{2})?',
        file: resolve('./src/pages/[v]/[lang]/index.vue')

      })
    })

    addImportsDir(resolve('./src/composables'))
    addImportsDir(resolve('./src/utils'))

    nuxt.hook('pages:resolved', (pages: PageMeta[]) => {
      const exclude = ['index', 'lang', 'lang-index', 'lang-slug']
      const newPages = pages.filter(page => !exclude.includes(page.name))

      pages.length = 0
      pages.push(...newPages)
    })

    nuxt.hook('app:templates', (app) => {
      app.mainComponent = resolve('./src/app.vue')
      app.layouts.docs.file = resolve('./src/layouts/docs.vue')
    })

    // To allow override templates of Docus layer
    const docusIndex = nuxt.options._layers.findIndex(x => x.configFile.endsWith('docus/nuxt.config.ts'))
    const versioningIndex = nuxt.options._layers.findIndex(x => x.configFile.endsWith('docs-versioning/nuxt.config.ts'))
    if (docusIndex > -1 && versioningIndex > -1 && docusIndex < versioningIndex) {
      const docusLayer = nuxt.options._layers[docusIndex]
      nuxt.options._layers[docusIndex] = nuxt.options._layers[versioningIndex]
      nuxt.options._layers[versioningIndex] = docusLayer
    }

    const cssTemplate = addTemplate({
      filename: 'docs-versioning.css',
      getContents: () => {
        return `@import "tailwindcss";

@source "src/**/*.vue";`
      },
    })

    nuxt.options.css.push(cssTemplate.dst)
  },
})
