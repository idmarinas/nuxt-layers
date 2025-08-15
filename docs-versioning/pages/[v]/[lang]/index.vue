<script lang="ts" setup>
import type {Collections} from '@nuxt/content'

definePageMeta({
  path: '/:v(current|\\d+\.x)?/:lang(\\w{2})?',
})

const route = useRoute()
const {locale} = useDocusI18n()
const {collectionName} = useDocsVersioning()

const {data: page} = await useAsyncData(collectionName.value + locale.value, () => queryCollection(collectionName.value as keyof Collections).path(route.path).first())
if (!page.value) {
  throw createError({statusCode: 404, statusMessage: 'Page not found', fatal: true})
}

// Reconsider it once this is implemented: https://github.com/nuxt/content/issues/3419
const prose = page.value.meta?.prose as boolean
const title = page.value.seo?.title || page.value.title
const description = page.value.seo?.description || page.value.description

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
})

if (page.value?.seo?.ogImage) {
  useSeoMeta({
    ogImage: page.value.seo.ogImage,
    twitterImage: page.value.seo.ogImage,
  })
} else {
  defineOgImageComponent('Landing', {
    title,
    description,
  })
}
</script>

<template>
  <ContentRenderer
    v-if="page"
    :prose="prose || false"
    :value="page"
  />
</template>
