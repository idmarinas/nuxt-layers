import { z } from 'zod'

// import { defineRobotsSchema } from '@nuxtjs/robots/content'
// import { defineSitemapSchema } from '@nuxtjs/sitemap/content'
// import { defineSchemaOrgSchema } from 'nuxt-schema-org/content'
import { defineOgImageSchema } from 'nuxt-og-image/content'

export const BaseSchema = z.object({
  // robots: defineRobotsSchema(),
  // sitemap: defineSitemapSchema(),
  ogImage: defineOgImageSchema(),
  // schemaOrg: defineSchemaOrgSchema(),
})

export const DocsSchema = BaseSchema.extend({
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
  }).optional(),
})

export const BranchSchema = BaseSchema.extend({
  branch: z.string(),
  security: z.boolean().default(false).describe('Does the branch receive security updates?'),
  requirements: z.object({
    php: z.array(z.string()).default([]),
    symfony: z.array(z.string()).default([]),
    support: z.enum(['features', 'bugs', 'none']).default('none')
  }).required()
})

export const VersionSchema = BaseSchema.extend({
  version: z.string().describe('Version number: x.y.z'),
  date: z.date(),
  branch: z.string(),
  authors: z.array(z.object({
    name: z.string(),
    avatar: z.object({
      src: z.string(),
    }),
    to: z.string(),
    target: z.string().default('_blank'),
  })),
})
