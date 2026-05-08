import { defineCollection, defineContentConfig, type DefinedCollection } from '@nuxt/content'
import { z } from 'zod'
// import { defineRobotsSchema } from '@nuxtjs/robots/content'
// import { defineSitemapSchema } from '@nuxtjs/sitemap/content'
import { defineOgImageSchema } from 'nuxt-og-image/content'
// import { defineSchemaOrgSchema } from 'nuxt-schema-org/content'
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
  // robots: defineRobotsSchema(),
  // sitemap: defineSitemapSchema(),
  ogImage: defineOgImageSchema(),
  // schemaOrg: defineSchemaOrgSchema(),
})

const createBranchSchema = () => z.object({
  branch: z.string(),
  ogImage: defineOgImageSchema(),
})

const createDocsSchema = () => z.object({
  links: z.array(z.object({
    label: z.string(),
    icon: z.string(),
    to: z.string(),
    target: z.string().optional(),
  })).optional(),
  since: z.string().optional(),
  deprecated: z.object({
    since: z.string(),
    removed: z.string().optional(),
  }).optional()
  ogImage: defineOgImageSchema(),
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
