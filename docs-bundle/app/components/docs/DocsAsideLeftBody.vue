<script
  setup
  lang="ts"
>
const { sidebarNavigation } = useSubNavigation()
const route = useRoute()

const contentNavVariants = useUIConfig('contentNavigation')
const show = computed(() => {
  if (route.params.lang === 'about' || route.params.lang === 'security') {
    return false
  } else if (route.params.slug === 'about' || route.params.lang === 'security') {
    return false
  }

  return true
})
</script>

<template>
  <UContentNavigation v-if="show" :highlight="contentNavVariants.highlight ?? true"
    :highlight-color="contentNavVariants.highlightColor" :variant="contentNavVariants.variant ?? 'link'"
    :color="contentNavVariants.color" :navigation="sidebarNavigation" />
</template>
