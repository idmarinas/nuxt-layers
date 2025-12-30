<script setup lang="ts">
import type { LabelProps } from '../../bundle.config';

const bundle = useAppConfig().docsBundle

const props = defineProps({
  n: {
    type: String,
    default: ''
  }
})

const content = computed((): LabelProps | undefined => {
  if (!props.n) return undefined

  const keys = props.n.split('.')
  let value: any = bundle.labels

  for (const key of keys) {
    value = value?.[key]
  }

  return value as LabelProps | undefined
})

</script>

<template>
  <UTooltip v-if="content" v-bind="content.tooltip" :disabled="!!content.tooltip?.disabled">
    <UBadge v-bind="content" />
  </UTooltip>
</template>
