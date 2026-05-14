<script setup lang="ts">
import type { BranchesCollectionItem, Collections } from '@nuxt/content'

const props = withDefaults(defineProps<{
  version: string
  isNew?: boolean
}>(), {
  isNew: false
})

const { locale, isEnabled } = useDocusI18n()
const collectionName = computed(() => isEnabled.value ? `branches_${locale.value}` : 'branches')
const versionMajor = computed(() => {
  const versionMatch = props.version.match(/^(\d+)(?:_|\.)(\d+)(?:(?:_|\.)(\d+))?$/)
  if (!versionMatch) {
    return 0
  }

  const [, majorText] = versionMatch

  return Number(majorText)
})

const { data: branch } = await useAsyncData(`label-version-${versionMajor.value}`, async () => {
  return await queryCollection(collectionName.value as keyof Collections)
    .where('branch', '=', `${versionMajor.value}.x`)
    .select('branch' as any, 'security', 'requirements')
    .first() as BranchesCollectionItem
})

const color = computed(() => {
  const supported = branch.value?.requirements.support
  const security = branch.value?.security

  if ('features' === supported) {
    return 'primary'
  } else if ('none' === supported && !security) {
    return 'error'
  } else if ('none' === supported && security) {
    return 'yellow'
  } else if ('bugs' === supported) {
    return 'orange'
  }

  return 'neutral'
})

const variant = computed(() => {
  const supported = branch.value?.requirements.support
  const security = Boolean(branch.value?.security)

  if ('features' === supported) {
    return 'outline'
  } else if ('none' === supported && !security) {
    return 'solid'
  } else if ('none' === supported && security) {
    return 'subtle'
  } else if ('bugs' === supported) {
    return 'outline'
  }

  return 'solid'
})

const tooltip = computed(() => {
  const supported = branch.value?.requirements.support
  const security = branch.value?.security

  if (props.isNew) {
    return `New in version ${props.version}`
  } else if ('features' === supported) {
    return 'New features bug and security fixes'
  } else if ('none' === supported && !security) {
    return 'No longer maintained'
  } else if ('none' === supported && security) {
    return 'Security fixes only'
  } else if ('bugs' === supported) {
    return 'Bug and security fixes'
  }

  return 'Unknown version'
})
</script>

<template>
  <UTooltip :text="tooltip" arrow :delay-duration="100">
    <UBadge :color="color" :variant="variant" :icon="!branch ? '' : 'i-tabler-tag'" :label="version" />
  </UTooltip>
</template>
