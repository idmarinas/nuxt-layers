import type {DefinedCollection} from '@nuxt/content'
import {defineCollection, defineContentConfig, z} from '@nuxt/content'
import type {Version} from './utils/version'
import {useNuxt} from '@nuxt/kit'
import {joinURL} from 'ufo'

const {options} = useNuxt()
const cwd = joinURL(options.rootDir, 'content')
const versions: Version[] = options.appConfig?.docsVersioning?.versions || []
const isEnabled: boolean = options.appConfig?.docsVersioning?.enable || false

// Not use prefix strategy
options.i18n.strategy = 'no_prefix'

const DocsSchema = z.object({
  links: z.array(z.object({
    label: z.string(),
    icon: z.string(),
    to: z.string(),
    target: z.string().optional(),
  })).optional(),
})

const collections: Record<string, DefinedCollection> = []

versions.filter(v => !v.isCurrent).forEach(v => {
  collections[v.collection] = defineCollection({
    type: 'page',
    source: {
      cwd: undefined,
      repository: '',
      include: 'docs/content/**/*',
      exclude: ['docs/content/**/*.json'],
      prefix: v.path
    },
    schema: DocsSchema,
  })
})

collections['docs_versioning'] = defineCollection({
  type: 'page',
  source: {
    cwd,
    include: '**/*.md',
    exclude: ['index.md'],
    prefix: isEnabled ? '/current' : '/'
  },
  schema: DocsSchema,
})

export default defineContentConfig({collections})
