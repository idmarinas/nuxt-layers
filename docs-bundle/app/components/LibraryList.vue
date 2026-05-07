<script lang="ts" setup>
const bundle = useAppConfig().docsBundle
</script>

<template>
  <UPageGrid>
    <UPageCard v-for="card in bundle.libraries" key="card" target="_blank" v-bind="card" />
  </UPageGrid>
</template>
