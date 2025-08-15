<script lang="ts" setup>
import {kebabCase} from 'scule'
import type {Collections, ContentNavigationItem, DocsCollectionItem} from '@nuxt/content'
import {findPageHeadline} from '@nuxt/content/utils'
// import { addPrerenderPath } from '../../utils/prerender'

definePageMeta({
  path: '/:v(current|\\d+\.x)?/:lang(\\w{2})?/:slug(.*)*',
  layout: 'docs',
})

const route = useRoute()
const {locale, t} = useDocusI18n()
const {collectionName} = useDocsVersioning()
const appConfig = useAppConfig()
const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')

const [{data: page}, {data: surround}] = await Promise.all([
  useAsyncData(kebabCase(route.path), () => queryCollection(collectionName.value as keyof Collections).path(route.path).first()),
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

const headline = computed(() => findPageHeadline(navigation?.value, page.value?.path))
defineOgImageComponent('Docs', {
  headline: headline.value,
})

const editLink = computed(() => {
  if (!appConfig.github) {
    return
  }

  return [
    appConfig.github.url,
    'edit',
    appConfig.github.branch,
    appConfig.github.rootDir,
    'content',
    `${page.value?.stem}.${page.value?.extension}`,
  ].filter(Boolean).join('/')
})
</script>

<template>
  <UPage v-if="page">
    <UPageHeader
      :description="page.description"
      :headline="headline"
      :title="page.title"
      :ui="{
        wrapper: 'flex-row items-center flex-wrap justify-between',
      }"
    >
      <template #links>
        <UButton
          v-for="(link, index) in (page as DocsCollectionItem).links"
          :key="index"
          size="sm"
          v-bind="link"
        />

        <DocsPageHeaderLinks />
      </template>
    </UPageHeader>

    <UPageBody>
      <ContentRenderer
        v-if="page"
        :value="page"
      />

      <USeparator>
        <div
          v-if="editLink"
          class="flex items-center gap-2 text-sm text-muted"
        >
          <UButton
            :to="editLink"
            :ui="{ leadingIcon: 'size-4' }"
            color="neutral"
            icon="i-lucide-pen"
            target="_blank"
            variant="link"
          >
            {{ t('docs.edit') }}
          </UButton>
          <span>{{ t('common.or') }}</span>
          <UButton
            :to="`${appConfig.github.url}/issues/new/choose`"
            :ui="{ leadingIcon: 'size-4' }"
            color="neutral"
            icon="i-lucide-alert-circle"
            target="_blank"
            variant="link"
          >
            {{ t('docs.report') }}
          </UButton>
        </div>
      </USeparator>
      <UContentSurround :surround="surround" />
    </UPageBody>

    <template
      v-if="page?.body?.toc?.links?.length"
      #right
    >
      <UContentToc
        :links="page.body?.toc?.links"
        :title="appConfig.toc?.title || t('docs.toc')"
        highlight
      >
        <template #bottom>
          <DocsAsideRightBottom />
        </template>
      </UContentToc>
    </template>
  </UPage>
</template>
