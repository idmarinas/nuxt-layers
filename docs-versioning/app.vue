<script lang="ts" setup>
import type {PageCollections} from '@nuxt/content'
import * as locales from '@nuxt/ui-pro/locale'

const {seo} = useAppConfig()
const site = useSiteConfig()

const {locale, isEnabled: localeIsEnabled} = useDocusI18n()
const {version, isEnabled: versioningIsEnabled, collectionName} = useDocsVersioning()

const lang = computed(() => locales[locale.value as keyof typeof locales]?.code || 'en')
const dir = computed(() => locales[locale.value as keyof typeof locales]?.dir || 'ltr')

const {data: navigation} = await useAsyncData(`navigation_${collectionName.value}`, () => queryCollectionNavigation(collectionName.value as keyof PageCollections), {
  transform: (data) => {
    if (versioningIsEnabled) {
      data = data.find(item => item.path === version.value.path)?.children || data
    }

    if (localeIsEnabled.value) {
      let path = `${versioningIsEnabled ? version.value.path : ''}/${locale.value}`
      data = data.find(item => item.path === path)?.children || data
    }

    return data
  },
  watch: [locale],
})
const {data: files} = useLazyAsyncData(`search_${collectionName.value}`, () => queryCollectionSearchSections(collectionName.value as keyof PageCollections), {
  server: false,
})

useHead({
  meta: [
    {name: 'viewport', content: 'width=device-width, initial-scale=1'},
  ],
  link: [
    {rel: 'icon', href: '/favicon.ico'},
  ],
  htmlAttrs: {
    lang,
    dir,
  },
})

useSeoMeta({
  titleTemplate: seo.titleTemplate,
  title: seo.title,
  description: seo.description,
  ogSiteName: site.name,
  twitterCard: 'summary_large_image',
})

provide('navigation', navigation)
</script>

<template>
  <UApp :locale="locales[locale as keyof typeof locales]">
    <NuxtLoadingIndicator color="var(--ui-primary)" />

    <AppHeader />

    <UMain>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </UMain>

    <AppFooter />

    <ClientOnly>
      <LazyUContentSearch
        :files="files"
        :navigation="navigation"
      />
    </ClientOnly>
  </UApp>
</template>
