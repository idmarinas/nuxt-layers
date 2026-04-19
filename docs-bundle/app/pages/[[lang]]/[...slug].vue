<script lang="ts" setup>
import {kebabCase} from 'scule'
import type {Collections, ContentNavigationItem, DocsCollectionItem} from '@nuxt/content'
import {findPageHeadline} from '@nuxt/content/utils'

definePageMeta({
  layout: 'docs',
})

const route = useRoute()
const {locale, isEnabled, t} = useDocusI18n()
const appConfig = useAppConfig()
const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')

const collectionName = computed(() => isEnabled.value ? `docs_${locale.value}` : 'docs')

const [{data: page}, {data: surround}] = await Promise.all([
  useAsyncData(kebabCase(route.path), () => queryCollection(collectionName.value as keyof Collections).path(route.path).first() as Promise<DocsCollectionItem>),
  useAsyncData(`${kebabCase(route.path)}-surround`, () => {
    return queryCollectionItemSurroundings(collectionName.value as keyof Collections, route.path, {
      fields: ['description'],
    })
  }),
])

if (!page.value) {
  throw createError({statusCode: 404, statusMessage: 'Page not found', fatal: true})
}

// Add the page path to the prerender list
// addPrerenderPath(`/raw${route.path}.md`)

const title = page.value.seo?.title || page.value.title
const description = page.value.seo?.description || page.value.description

useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description,
})

const headline = ref(findPageHeadline(navigation?.value, page.value?.path))
watch(() => navigation?.value, () => {
  headline.value = findPageHeadline(navigation?.value, page.value?.path) || headline.value
})

// Define the OG Image
if (page.value?.seo?.ogImage === undefined) {
  defineOgImage('DocsTakumi', {
    title,
    description,
    headline: headline.value,
  })
}

const github = computed(() => appConfig.github ? appConfig.github : null)

const editLink = computed(() => {
  if (!github.value) {
    return
  }

  return [
    github.value.url,
    'edit',
    github.value.branch,
    github.value.rootDir,
    'content',
    `${page.value?.stem}.${page.value?.extension}`,
  ].filter(Boolean).join('/')
})
</script>

<template>
  <UPage v-if="page">
    <UPageHeader :description="page.description" :headline="headline" :title="page.title" :ui="{
      wrapper: 'flex-row items-center flex-wrap justify-between',
    }">
      <template #links>
        <UButton v-for="(link, index) in (page as DocsCollectionItem).links" :key="index" size="sm" v-bind="link" />

        <DocsPageHeaderLinks />
      </template>
    </UPageHeader>

    <UPageBody>
      <ContentRenderer v-if="page" :value="page" />

      <USeparator>
        <div v-if="github" class="flex items-center gap-2 text-sm text-muted">
          <UButton :to="editLink" :ui="{ leadingIcon: 'size-4' }" color="neutral" icon="i-tabler-pencil" target="_blank"
                   variant="link">
            {{ t('docs.edit') }}
          </UButton>
          <span>{{ t('common.or') }}</span>
          <UButton :to="`${github.url}/issues/new/choose`"
                   :ui="{ leadingIcon: 'size-4' }"
                   color="neutral"
                   icon="i-tabler-alert-circle"
                   target="_blank"
                   variant="link">
            {{ t('docs.report') }}
          </UButton>
        </div>
      </USeparator>
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
</template>
