import { defineCollection, defineContentConfig, type DefinedCollection, z } from '@nuxt/content'
import { join } from 'pathe'
import { useNuxt } from '@nuxt/kit'
import { asOgImageCollection } from 'nuxt-og-image/content'

const { options } = useNuxt()
const locales = (options as any).i18n?.locales

const createDocsSchema = () => z.object({
  version: z.string(),
  title: z.string(),
  description: z.string(),
  date: z.string(),
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

const langs = locales || ['']
const collections: Record<string, DefinedCollection> = {}
const cwd = join(options.rootDir, 'changelog')

for (const locale of langs) {
  let code = typeof locale === 'string' ? locale : locale.code
  code = code === '' ? '' : '_' + code

  collections[`changelog_v${code}`] = defineCollection({
    type: 'page',
    source: {
      cwd,
      include: '**/*.md',
      exclude: ['**/index.md'],
      prefix: '/changelog',
    },
    schema: createDocsSchema(),
  })

  collections[`changelog${code}`] = defineCollection({
    type: 'page',
    source: {
      cwd,
      include: '**/index.md',
      prefix: '/changelog',
    },
    schema: createDocsSchema(),
  })
}

export default defineContentConfig({ collections })
