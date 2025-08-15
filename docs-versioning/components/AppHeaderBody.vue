<script lang="ts" setup>
import type {ContentNavigationItem} from '@nuxt/content'

const {isEnabled} = useDocsVersioning()
const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')
</script>

<template>
  <template v-if="isEnabled">
    <VersionSelect />
    <USeparator class="my-6" type="dashed" />
  </template>

  <UContentNavigation
    :navigation="navigation"
    highlight
    variant="link"
  />
</template>
