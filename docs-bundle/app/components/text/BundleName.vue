<script setup lang="ts">
const bundle = useAppConfig().docsBundle
const bundleName = computed(() => bundle.name.replace(bundle.short_name, `<span class="text-primary">${bundle.short_name}</span>`))
</script>

<template>
  <span v-html="bundleName" />
</template>
