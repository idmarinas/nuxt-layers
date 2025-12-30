<script lang="ts" setup>
const bundle = useAppConfig().docsBundle
</script>

<template>
  <ProsePre language="bash" filename="Terminal">
    composer require {{ bundle.package_name }}
  </ProsePre>
</template>
