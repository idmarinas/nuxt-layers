<script setup lang="ts">
import { kebabCase } from 'scule'
import type { Collections, VersionsCollectionItem } from '@nuxt/content'
import type { ButtonProps } from '@nuxt/ui'

definePageMeta({
  layout: 'changelog',
  path: '/:lang?/changelog/:v(\\d+_x)/:semver(\\d+_\\d+_\\d+)',
})

const route = useRoute()
const { locale, isEnabled, t } = useDocusI18n()
const { lastRelease } = await useReleases()
const appConfig = useAppConfig()
const collectionName = computed(() => isEnabled.value ? `versions_${locale.value}` : 'versions')

const [{ data: page }, { data: surround }] = await Promise.all([
  useAsyncData(kebabCase(route.path), () => queryCollection(collectionName.value as keyof Collections)
    .where('version', '=', (route.params.semver as string).replaceAll('_', '.'))
    .first() as Promise<VersionsCollectionItem>),
  useAsyncData(kebabCase(route.path) + '-surround', () => queryCollectionItemSurroundings(collectionName.value as keyof Collections, route.path, { fields: ['description'], }))
])

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

const title = page.value.seo?.title || page.value.title
const description = page.value.seo?.description || page.value.description

useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description,
})

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
    `${page.value?.stem}.${page.value?.extension}`,
  ].filter(Boolean).join('/')
})

const headline = computed(() => {
  if (!isLastRelease.value) {
    return 'Changelog'
  }

  return 'Latest Release'
})

const isLastRelease = computed(() => {
  if (!lastRelease || !lastRelease.value || !page.value) {
    return false
  }

  return lastRelease.value.version === page.value.version
})

defineOgImageComponent('Release', {
  title,
  description,
  headline: page.value.version
})

const links = ref((): ButtonProps[] => {
  if (!github.value) {
    return []
  }

  return [
    {
      label: 'Tag ' + page.value?.version,
      icon: 'i-tabler-tag',
      color: 'success',
      to: `${github.value.url}/releases/tag/${page.value?.version}`,
      target: '_blank'
    }, {
      label: 'Branch ' + page.value?.branch,
      icon: 'i-tabler-git-branch',
      // color: 'primary',
      to: `${github.value.url}/tree/${page.value?.branch}`,
      target: '_blank'
    }
  ]
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
    <UPageHeader v-bind="page" :links="links()">
      <template #headline>
        <UBadge variant="soft" :icon="isLastRelease ? 'i-tabler-rocket' : undefined">
          {{ headline }}
        </UBadge>
      </template>
    </UPageHeader>

    <UPageBody>
      <UBreadcrumb :items="items" />
      <UChangelogVersion v-bind="page" :indicator="false" :title="undefined" :description="undefined" :ui="{
        container: 'w-full max-w-full'
      }">
        <template #body>
          <ContentRenderer v-if="page" :value="page" />
        </template>
      </UChangelogVersion>

      <USeparator>
        <div v-if="github" class="flex items-center gap-2 text-sm text-muted">
          <UButton variant="link" color="neutral" :to="editLink" target="_blank" icon="i-tabler-pencil"
            :ui="{ leadingIcon: 'size-4' }">
            {{ t('docs.edit', '', {}) }}
          </UButton>
          <span>{{ t('common.or', '', {}) }}</span>
          <UButton variant="link" color="neutral" :to="`${github.url}/issues/new/choose`" target="_blank"
            icon="i-tabler-alert-circle" :ui="{ leadingIcon: 'size-4' }">
            {{ t('docs.report', '', {}) }}
          </UButton>
        </div>
      </USeparator>
      <UContentSurround :surround="surround" />
    </UPageBody>

    <template #right>
      <UContentToc highlight :title="appConfig.toc?.title || t('docs.toc', '', {})" :links="page.body?.toc?.links">
        <template #bottom>
          <LastRelease v-if="!isLastRelease" :separator="!!page?.body?.toc?.links?.length" />
          <DocsAsideRightBottom />
        </template>
      </UContentToc>
    </template>
  </UPage>
</template>
