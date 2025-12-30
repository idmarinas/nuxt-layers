<script lang="ts" setup>
const bundle = useAppConfig().docsBundle
</script>

<template>
  <ProsePre language="php" filename="config/bundles.php">
    <pre>
return [
  // ...
  {{ bundle.vars.namespace }}::class => ['all' => true],
];</pre>
  </ProsePre>
</template>
