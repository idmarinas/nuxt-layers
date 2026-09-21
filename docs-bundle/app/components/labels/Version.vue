<script setup lang="ts">
import type { BranchesCollectionItem, Collections } from '@nuxt/content'

const props = withDefaults(defineProps<{
  version: string
  isNew?: boolean
}>(), {
  isNew: false
})

const { locale, isEnabled, t } = useBundleI18n()
const collectionName = computed(() => isEnabled.value ? `branches_${locale.value}` : 'branches')
const versionMajorMinor = computed(() => {
  const versionMatch = props.version.match(/^(\d+)(?:_|\.)(\d+)(?:(?:_|\.)(\d+))?$/)
  if (!versionMatch) {
    return [0,0]
  }

  const [, majorText, minorText] = versionMatch

  return [Number(majorText), Number(minorText)]
})

const { data: branch } = await useAsyncData(`label-version-${versionMajorMinor.value.join('-')}`, async () => {
  const [majorVersion, minorVersion] = versionMajorMinor.value

  // Format N.x
  let branch = await queryCollection(collectionName.value as keyof Collections)
    .where('branch', '=', `${majorVersion}.x`)
    .select('branch' as any, 'security', 'requirements')
    .first() as BranchesCollectionItem

    // Check for format N.N.x
    if (!branch) {
      branch = await queryCollection(collectionName.value as keyof Collections)
        .where('branch', '=', `${majorVersion}.${minorVersion}.x`)
        .select('branch' as any, 'security', 'requirements')
        .first() as BranchesCollectionItem
    }

    return branch
})

const color = computed(() => {
  const supported = branch.value?.requirements?.support || 'none'
  const security = branch.value?.security || false

  if ('features' === supported) {
    return 'primary'
  } else if ('none' === supported && !security) {
    return 'error'
  } else if ('none' === supported && security) {
    return 'warning'
  } else if ('bugs' === supported) {
    return 'deprecated'
  }

  return 'neutral'
})

const variant = computed(() => {
  const supported = branch.value?.requirements?.support || 'none'
  const security = branch.value?.security || false

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
  const supported = branch.value?.requirements?.support || 'none'
  const security = branch.value?.security || false

  if (props.isNew) {
    return t('label.version.new', { version: props.version})
  } else if ('features' === supported) {
    return t('label.version.features')
  } else if ('none' === supported && !security) {
    return t('label.version.none')
  } else if ('none' === supported && security) {
    return t('label.version.security')
  } else if ('bugs' === supported) {
    return t('label.version.bug_security')
  }

  return t('label.version.unknown')
})
</script>

<template>
  <UTooltip :text="tooltip" arrow :delay-duration="100">
    <UBadge :color="color" :variant="variant" :icon="!branch ? '' : 'i-tabler-tag'" :label="version" />
  </UTooltip>
</template>
