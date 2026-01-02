import type { Author, DocsBundleConfig, LabelProps } from '../bundle.config'
import type { TooltipProps } from '@nuxt/ui'
import type { FileAfterParseHook } from '@nuxt/content'
import type { Nuxt } from 'nuxt/schema'
import { defineNuxtModule, useLogger, useNuxt } from 'nuxt/kit'
import { defu } from 'defu'
import { pascalCase, titleCase } from 'scule'
import { getGitEnv, getLocalGitInfo } from 'docus/utils/git'
import { updateSiteConfig } from 'nuxt-site-config/kit'

interface ModuleOptions {
  package_name: string;
  versions: string[];
  name?: string;
  description?: string;
  author?: Author;
  short_name?: string;
  repository?: {
    name?: string; owner?: string;
  };
  colors: Record<string, string>;
  authors: Record<string, Author>;
  labels: Record<string, Record<string, LabelProps> | LabelProps>;
  socials: Record<string, string>;
  support_links: { title: string, links: object[] };
}

const defaultTooltip: TooltipProps = {
  arrow: true,
  delayDuration: 300,
}

// Author definition (default author)
const idmarinas: Author = {
  name: 'Iván Diaz',
  description: '@IDMarinas',
  username: 'IDMarinas',
  avatar: { src: 'https://avatars.githubusercontent.com/u/35842929?v=4' },
  to: 'https://github.com/idmarinas',
  target: '_blank'
}

const MODULE_NAME = '@idmarinas/docs-bundle'
const UI_THEME_COLORS = ['primary', 'secondary', 'success', 'info', 'warning', 'error']

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: MODULE_NAME,
    configKey: 'docsBundle',
    version: '0.1.0',
    compatibility: {
      nuxt: '^4.0.0'
    }
  },
  defaults: {
    colors: { purple: 'purple' },
    labels: {
      wip: {
        label: 'WIP',
        color: 'purple',
        icon: 'i-tabler-progress-bolt',
        tooltip: {
          ...defaultTooltip,
          text: 'Work in progress',
        }
      },
      beta: {
        label: 'β',
        color: 'purple',
        icon: 'i-tabler-beta',
        tooltip: {
          ...defaultTooltip,
          text: 'Beta version',
        }
      }
    },
    socials: {
      x: 'https://x.com/idmarinas',
      reddit: 'https://reddit.com/u/idmarinas',
      paypal: 'https://www.paypal.me/idmarinas',
      bitly: 'https://bit.ly/m/idmarinas',
      githubsponsors: 'https://github.com/sponsors/idmarinas'
    },
    support_links: {
      title: 'Support me',
      links: [
        {
          icon: 'i-tabler-brand-paypal',
          label: 'PayPal.Me',
          to: 'https://www.paypal.me/idmarinas',
          target: '_blank'
        },
        {
          icon: 'i-tabler-brand-github',
          label: 'GitHub Sponsor',
          to: 'https://github.com/sponsors/idmarinas',
          target: '_blank'
        }
      ]
    },
    authors: {
      idmarinas,
      author: idmarinas,
      developer: idmarinas,
      maintainer: idmarinas,
      default: idmarinas,
    }
  },
  moduleDependencies: {
    'nuxt-seo-utils': {
      version: '>=7.0.0',
      optional: false
    }
  },
  async setup(options: ModuleOptions, nuxt) {
    const logger = useLogger()
    const missed: string[] = []

    const gitInfo = await getLocalGitInfo(nuxt.options.rootDir) || getGitEnv()

    if (gitInfo?.owner && gitInfo?.name) {
      options.package_name ||= `${gitInfo.owner}/${gitInfo.name}`
    }

    options.package_name || missed.push('package_name')
    options.versions || missed.push('versions')

    if (missed.length > 0) {
      logger.error(`[${MODULE_NAME}] At a minimum, the following options must be configured: "${missed.join('", "')}"`)

      return
    }

    if (!options.package_name.includes('/')) {
      logger.error(`[${MODULE_NAME}] The format for "package_name" must be "vendor/repo-name."`)

      return
    }

    const { docsBundle, socials } = createDocsBundleConfig(options.package_name, options, nuxt)

    // Merge docsBundle config
    nuxt.options.appConfig.docsBundle = defu(nuxt.options.appConfig.docsBundle, docsBundle)

    nuxt.options.runtimeConfig.docsBundle = {
      authors: options.authors as typeof nuxt.options.runtimeConfig.docsBundle.authors,
      repository: docsBundle.repository as typeof nuxt.options.runtimeConfig.docsBundle.repository
    }

    nuxt.hook('modules:done', () => {
      nuxt.options.appConfig.ui.colors = Object.assign({}, nuxt.options.appConfig.ui.colors, options.colors)

      const colors = new Set(nuxt.options.ui.theme?.colors || UI_THEME_COLORS)
      Object.keys(nuxt.options.appConfig.ui.colors!).forEach(color => !colors.has(color) && colors.add(color))

      // Nuxt Config
      nuxt.options.seo = defu(nuxt.options.seo, {
        meta: {
          title: docsBundle.name,
          description: docsBundle.description,
          twitterCreator: `@${docsBundle.repository.owner}`,
        }
      })
      nuxt.options.ui.theme = Object.assign({}, nuxt.options.ui.theme, { colors: Array.from(colors) })

      // Modify AppConfig defaults
      nuxt.options.appConfig.header.title = docsBundle.name
      nuxt.options.appConfig.seo = Object.assign({}, nuxt.options.appConfig.seo, {
        title: docsBundle.name,
        titleTemplate: `%s - ${docsBundle.name}`
      })
      nuxt.options.appConfig.socials = defu(nuxt.options.appConfig.socials, socials)
      nuxt.options.appConfig.toc = defu(nuxt.options.appConfig.toc, {
        bottom: options.support_links
      })
    })

    nuxt.hook('nuxt-og-image:runtime-config', (config) => {
      config.defaults = defu(config.defaults, {
        props: {
          headline: docsBundle.name,
          description: docsBundle.description,
          socials: {
            icons: docsBundle.socialsIconsOnly(['github']),
            username: docsBundle.repository.owner
          }
        }
      })

      config.defaults.component = 'Docs'
    })

    // @ts-ignore
    nuxt.hook('site-config:resolve', () => {
      updateSiteConfig({
        name: docsBundle.name,
        description: docsBundle.description,
      })
    })
  },
  hooks: {
    'content:file:afterParse'(ctx: FileAfterParseHook) {
      const nuxt = useNuxt()
      const options = nuxt.options.runtimeConfig.docsBundle

      if (ctx.collection.name.startsWith('changelog_v')) {
        if (ctx.content.authors === undefined || Array.isArray(ctx.content.authors) && ctx.content.authors.length === 0) {
          ctx.content.authors = [getAuthorByUserName(options.authors, 'idmarinas')]
        } else if (typeof ctx.content.authors === 'string') {
          const author = getAuthorByUserName(options.authors, ctx.content.authors)
          ctx.content.authors = author ? [author] : []
        } else if (Array.isArray(ctx.content.authors)) {
          for (const [index, author] of ctx.content.authors.entries()) {
            if (typeof author === 'string') {
              const obj = getAuthorByUserName(options.authors, author)
              if (obj) {
                ctx.content.authors[index] = obj
              } else {
                ctx.content.authors.splice(index, 1)
              }
            }
          }
        }
      }
    }
  }
})

function createDocsBundleConfig(packageName: string, options: ModuleOptions, nuxt: Nuxt) {
  const docsBundle = {} as DocsBundleConfig
  const package_name = packageName.trim()
  const index = package_name.indexOf('/')
  const repository = {
    name: package_name.slice(index + 1, package_name.length),
    owner: package_name.slice(0, index)
  }
  const short_name = titleCase(repository.name).replace('Bundle', '').trim()
  const vendor = pascalCase(repository.owner === 'idmarinas' ? 'idm' : repository.owner)


  docsBundle.package_name = package_name
  docsBundle.repository = repository
  docsBundle.author = options.author || getAuthorByUserName(options.authors, repository.owner, repository.owner)!
  docsBundle.short_name = options.short_name || short_name

  // Name and Description
  docsBundle.name = options.name || `${docsBundle.author.username} ${short_name} Bundle`
  docsBundle.description = options.description || ''

  // Vars - namespace
  docsBundle.vars = {
    namespace: `${vendor}\\Bundle\\${short_name}\\${vendor}${short_name}Bundle`
  }

  // Labels
  docsBundle.labels = {
    versions: parseLabelsForVersions(options.versions),
    ...options.labels
  }

  // Social icons
  const socials = defu(nuxt.options.appConfig.socials, options.socials)
  docsBundle.socialsIconsOnly = (extra = []): string[] => {
    const icons = new Set(Object.keys(socials))
    extra.forEach(v => !icons.has(v) && icons.add(v))

    return Array.from(icons).map(key => `i-simple-icons-${key}`)
  }

  return { docsBundle, socials }
}

function parseLabelsForVersions(versions: string[]) {
  return Object.fromEntries(versions.map((version, index) => [
    `v${version.replace('.', '_')}`,
    {
      label: version,
      color: 0 === index ? 'primary' : 'secondary',
      icon: 'i-tabler-tag',
      tooltip: {
        ...defaultTooltip,
        text: `New in version ${version}`,
      }
    }
  ])
  )
}

const getAuthorByUserName = (authors: Record<string, Author>, userName: string, placeholder?: string): undefined | Author => {
  let defaultAuthor: Author | undefined = undefined

  if (placeholder?.length && placeholder.length > 1) {
    defaultAuthor = {
      name: placeholder,
      username: placeholder,
      description: '',
      avatar: { src: '' }
    }
  }

  return authors[userName] ?? defaultAuthor
}
