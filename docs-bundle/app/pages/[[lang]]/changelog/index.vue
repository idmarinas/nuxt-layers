<script setup lang="ts">
import type {
  Collections, ChangelogVCollectionItem, ChangelogCollectionItem, PageCollections
} from '@nuxt/content'

definePageMeta({
  layout: 'changelog',
  path: '/:lang?/changelog/:v(\\d+\.x)?',
})

const route = useRoute()
const { locale, isEnabled, t } = useDocusI18n()
const appConfig = useAppConfig()

// Dynamic collection name based on i18n status
const collectionName = computed(() => {
  const collection = route.params.v ? 'changelog_v' : 'changelog'
  return isEnabled.value ? `${collection}_${locale.value}` : collection
})
const pageName = computed(() => isEnabled.value ? `changelog_${locale.value}` : 'changelog')

const [{ data: pages }, { data: page }, { data: surround }] = await Promise.all([
  useAsyncData(collectionName.value + route.params.v, () => {
    const query = queryCollection(collectionName.value as keyof PageCollections)

    if (route.params.v) {
      query.where('branch', '=', route.params.v).order('date' as any, 'DESC')
    } else {
      query.where('branch', 'IS NOT NULL').order('date' as any, 'DESC')
    }

    return query.all() as Promise<ChangelogVCollectionItem[]>
  }),
  useAsyncData(`page_${pageName.value}_${route.params.v}`, () => {
    const query = queryCollection(pageName.value as keyof Collections)

    if (route.params.v) {
      query.where('branch', '=', route.params.v)
    } else {
      query.where('branch', 'IS NULL')
    }

    return query.first() as Promise<ChangelogCollectionItem>
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
        <UBadge variant="soft" label="Changelog" />
      </template>
    </UPageHeader>
    <UPageBody>
      <UBreadcrumb :items="items" />

      <UChangelogVersions>
        <UChangelogVersion v-for="(version, index) in pages" :key="index" v-bind="version" :to="version.path" />
      </UChangelogVersions>

      <UContentSurround :surround="surround" />
    </UPageBody>
    <template #right>
      <UContentToc highlight :title="appConfig.toc?.title || t('docs.toc', '', {})" :links="page.body?.toc?.links">
        <template #bottom>
          <LastRelease :separator="!!page?.body?.toc?.links?.length" />
          <DocsAsideRightBottom />
        </template>
      </UContentToc>
    </template>
  </UPage>
</template>
