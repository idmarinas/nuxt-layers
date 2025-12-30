<script lang="ts" setup>
const bundle = useAppConfig().docsBundle
</script>
<template>
  <UButton icon="i-tabler-brand-github" size="xl" target="_blank" variant="outline" color="neutral"
    :to="`https://github.com/${bundle.package_name}`">Star on Github</UButton>
</template>
