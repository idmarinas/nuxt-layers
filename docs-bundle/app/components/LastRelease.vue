<script lang="ts" setup>

const { lastRelease: release } = await useReleases()

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

    <UChangelogVersion v-if="!asBadge" v-bind="release" :indicator="false" description="Latest Release"
      :to="release.path" />
    <UBadge v-else :label="`Latest Release: ${release.version}`" color="primary" size="lg" icon="i-tabler-tag" />
  </template>
</template>
