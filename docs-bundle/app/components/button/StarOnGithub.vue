<script lang="ts" setup>
const bundle = useAppConfig().docsBundle
const { t } = useBundleI18n()
</script>
<template>
  <UButton icon="i-tabler-brand-github" size="xl" target="_blank" variant="outline" color="neutral"
    :to="`https://github.com/${bundle.package_name}`">{{ t('button.star_on.github') }}</UButton>
</template>
