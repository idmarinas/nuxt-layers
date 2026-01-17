import { defineCollection, defineContentConfig, type DefinedCollection, z } from '@nuxt/content'
import { join } from 'pathe'
import { useNuxt } from '@nuxt/kit'

const { options } = useNuxt()
const locales = (options as any).i18n?.locales

const createVersionsSchema = () => z.object({
  version: z.string(),
  title: z.string(),
  description: z.string(),
  date: z.date(),
  badge: z.string().optional(),
  branch: z.string(),
  authors: z.array(z.object({
    name: z.string(),
    avatar: z.object({
      src: z.string(),
    }),
    to: z.string(),
    target: z.string().default('_blank'),
  })),
  to: z.string(),
  target: z.string().default('_self'),
})

const createBranchSchema = () => z.object({
  branch: z.string(),
})

const createDocsSchema = () => z.object({
  links: z.array(z.object({
    label: z.string(),
    icon: z.string(),
    to: z.string(),
    target: z.string().optional(),
  })).optional(),
})

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
    schema: createVersionsSchema(),
  })

  collections[`branches${code}`] = defineCollection({
    type: 'page',
    source: {
      cwd: `${cwd}/.changelog`,
      include: '**/index.yaml',
      prefix: '/changelog',
    },
    schema: createBranchSchema(),
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
    schema: createDocsSchema(),
  })
}

export default defineContentConfig({ collections })
