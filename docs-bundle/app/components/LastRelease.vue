<script lang="ts" setup>

const { lastRelease: release } = await useReleases()

const { t } = useBundleI18n()

defineProps({
  separator: {
    type: Boolean,
    default: false,
  },
  asBadge: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <template v-if="release">
    <USeparator v-if="separator" type="dashed" />

    <UChangelogVersion v-if="!asBadge" v-bind="release" :indicator="false" :description="t('release.latest')"
      :to="release.path" />
    <UBadge v-else :label="t('release.badge', { version: release.version })" color="primary" size="lg" icon="i-tabler-tag" />
  </template>
</template>
