<script setup lang="ts">
const bundle = useAppConfig().docsBundle
</script>

<template>
  <div class="flex items-center gap-2 shrink-0">
    <SvgFavicon class="size-6" />
    {{ bundle.short_name }}
  </div>
</template>
