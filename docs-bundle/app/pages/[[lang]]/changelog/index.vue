<script lang="ts" setup>
import type { BranchsCollectionItem, Collections, PageCollections, VersionsCollectionItem } from '@nuxt/content'

definePageMeta({
  layout: 'changelog',
  path: '/:lang?/changelog/:v(\\d+_x)?',
})

const route = useRoute()
const { locale, isEnabled, t } = useDocusI18n()
const appConfig = useAppConfig()
const majorVersions = appConfig.docsBundle.majorVersions as Record<string, string>

// Dynamic collection name based on i18n status
const collectionName = computed(() => {
  const collection = route.params.v ? 'versions' : 'branches'
  return isEnabled.value ? `${collection}_${locale.value}` : collection
})
const pageName = computed(() => isEnabled.value ? `branches_${locale.value}` : 'branches')

const [{ data: pages }, { data: page }, { data: surround }] = await Promise.all([
  useAsyncData(collectionName.value + route.params.v, () => {
    const query = queryCollection(collectionName.value as keyof PageCollections)

    if (route.params.v) {
      query.where('branch', '=', (route.params.v as string).replaceAll('_', '.')).order('branch' as any, 'DESC')
    } else {
      query.where('branch', 'IS NOT NULL').order('branch' as any, 'DESC')
    }

    return query.all() as Promise<VersionsCollectionItem[]>
  }),
  useAsyncData(`page_${pageName.value}_${route.params.v}`, () => {
    const query = queryCollection(pageName.value as keyof Collections)

    if (route.params.v) {
      query.where('branch', '=', (route.params.v as string).replaceAll('_', '.'))
    } else {
      query.where('branch', 'IS NULL')
    }

    return query.first() as Promise<BranchsCollectionItem>
  }),
  useAsyncData(`page_${pageName.value}_${route.params.v}-surround`, () => {
    return queryCollectionItemSurroundings(pageName.value as keyof Collections, route.path, {
      fields: ['description'],
    })
  }),
])

if (!pages.value || !page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

const title = page.value.seo?.title || page.value.title
const description = page.value.seo?.description || page.value.description

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
})

defineOgImageComponent('Docs', {
  title,
  description,
  headline: 'Changelog'
})

const items = useBreadcrumbItems({
  overrides: [
    { label: 'Documentation', icon: 'i-tabler-book' },
    { label: '', icon: 'i-tabler-layout' },
    { label: '', icon: 'i-tabler-git-branch' },
    { label: '', icon: 'i-tabler-tag' }
  ]
})
</script>

<template>
  <UPage v-if="page">
    <UPageHeader v-bind="page">
      <template #headline>
        <UBadge label="Changelog" variant="soft" />
      </template>
    </UPageHeader>
    <UPageBody>
      <UBreadcrumb :items="items" />

      <UChangelogVersions>
        <UChangelogVersion v-for="(version, index) in pages" :key="index" v-bind="version"
          :date="majorVersions[version.branch.replace('.x', '')]" :to="version.path" />
      </UChangelogVersions>

      <UContentSurround :surround="surround" />
    </UPageBody>
    <template #right>
      <UContentToc :links="page.body?.toc?.links" :title="appConfig.toc?.title || t('docs.toc', '', {})" highlight>
        <template #bottom>
          <LastRelease :separator="!!page?.body?.toc?.links?.length" />
          <DocsAsideRightBottom />
        </template>
      </UContentToc>
    </template>
  </UPage>
  <UPage v-else>
    No se encuentra la rama
  </UPage>
</template>
