<script lang="ts" setup>
import type { BranchesCollectionItem, Collections, PageCollections, VersionsCollectionItem } from '@nuxt/content'

definePageMeta({
  layout: 'changelog',
  path: '/:lang?/changelog/:branch(\\d+_x|\\d+\.x)?',
})

const route = useRoute()
const { locale, isEnabled, t } = useDocusI18n()
const appConfig = useAppConfig()
const branchesInfo = appConfig.docsBundle.branchesInfo

// Dynamic collection name based on i18n status
const collectionName = computed(() => {
  const collection = route.params.branch ? 'versions' : 'branches'
  return isEnabled.value ? `${collection}_${locale.value}` : collection
})
const pageName = computed(() => isEnabled.value ? `branches_${locale.value}` : 'branches')

const [{ data: pages }, { data: page }, { data: surround }] = await Promise.all([
  useAsyncData(collectionName.value + route.params.branch, () => {
    const query = queryCollection(collectionName.value as keyof PageCollections)

    if (route.params.branch) {
      query.where('branch', '=', (route.params.branch as string).replaceAll('_', '.')).order('date' as any, 'DESC')
    } else {
      query.where('branch', 'IS NOT NULL').order('branch' as any, 'DESC')
    }

    return query.all() as Promise<VersionsCollectionItem[]>
  }),
  useAsyncData(`page_${pageName.value}_${route.params.branch}`, () => {
    const query = queryCollection(pageName.value as keyof Collections)

    if (route.params.branch) {
      query.where('branch', '=', (route.params.branch as string).replaceAll('_', '.'))
    } else {
      query.where('branch', 'IS NULL')
    }

    return query.first() as Promise<BranchesCollectionItem>
  }),
  useAsyncData(`page_${pageName.value}_${route.params.branch}-surround`, () => {
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

defineOgImage('DocsTakumi', {
  title,
  description,
  headline: 'Changelog'
})

const items = useBreadcrumbItems({
  overrides: [
    { label: 'Documentation', icon: 'i-tabler-book' },
    { label: '', icon: 'i-tabler-layout' },
    { label: page.value.branch?.replace('_', '.'), icon: 'i-tabler-git-branch' },
    { label: '', icon: 'i-tabler-tag' }
  ]
})

// Add the page path to the prerender list
addPrerenderPath(`/raw${route.path}.md`)
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
        <UChangelogVersion v-for="(version, index) in pages" v-bind="version" :key="index" :to="version.path"
          :date="!route.params.branch ? branchesInfo[`b${version.branch.replace('.', '_')}`]?.date as string : version.date" />
      </UChangelogVersions>

      <UContentSurround :surround="surround" />
    </UPageBody>
    <template #right>
      <UContentToc :links="page.body?.toc?.links" :title="appConfig.toc?.title || t('docs.toc')" highlight>
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
