import { defineCollection, defineContentConfig, type DefinedCollection } from '@nuxt/content'
import { join } from 'pathe'
import { useNuxt } from '@nuxt/kit'
import { BranchSchema, DocsSchema, VersionSchema } from './content.schema'

const { options } = useNuxt()
const locales = (options as any).i18n?.locales

const langs = locales || ['']
const collections: Record<string, DefinedCollection> = {}
const cwd = join(options.rootDir, 'content')

for (const locale of langs) {
  let code: string = typeof locale === 'string' ? locale : locale.code
  let codeCwd = code === '' ? '' : `${code}/`
  code = code === '' ? '' : `_${code}`

  // Changelog Collections
  collections[`versions${code}`] = defineCollection({
    type: 'page',
    source: {
      cwd: `${cwd}/.changelog`,
      include: '**/*.md',
      prefix: '/changelog',
    },
    schema: VersionSchema,
  })

  collections[`branches${code}`] = defineCollection({
    type: 'page',
    source: {
      cwd: `${cwd}/.changelog`,
      include: '**/index.yaml',
      prefix: '/changelog',
    },
    schema: BranchSchema,
  })

  // Docus original Collections
  collections[`landing${code}`] = defineCollection({
    type: 'page',
    source: {
      cwd,
      include: `${codeCwd}index.md`
    }
  })

  collections[`docs${code}`] = defineCollection({
    type: 'page',
    source: {
      cwd,
      include: `${codeCwd}**/*`,
      prefix: `/${codeCwd.replace('/', '')}`,
      exclude: [`${codeCwd}index.md`, `${codeCwd}.changelog/**/*`]
    },
    schema: DocsSchema,
  })
}

export default defineContentConfig({ collections })
