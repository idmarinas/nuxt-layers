import type {Version} from './utils/version'
import {defineNuxtModule} from '@nuxt/kit'
import githubVersions from './utils/githubVersions'

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
  async setup(options: ModuleOptions, nuxt) {
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

    // To allow override templates of Docus layer
    const docusIndex = nuxt.options._layers.findIndex(x => x.configFile.endsWith('docus/nuxt.config.ts'))
    const versioningIndex = nuxt.options._layers.findIndex(x => x.configFile.endsWith('docs-versioning/nuxt.config.ts'))
    if (docusIndex > -1 && versioningIndex > -1 && docusIndex < versioningIndex) {
      const docusLayer = nuxt.options._layers[docusIndex]
      nuxt.options._layers[docusIndex] = nuxt.options._layers[versioningIndex]
      nuxt.options._layers[versioningIndex] = docusLayer
    }
  },
})
