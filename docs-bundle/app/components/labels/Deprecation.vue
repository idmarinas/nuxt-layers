<script lang="ts">
import type { BadgeProps } from '@nuxt/ui'

export interface LabelsDeprecationProps extends BadgeProps {
  since: string
  removed?: string
  withTooltip?: boolean
}
</script>

<script setup lang="ts">
const props = withDefaults(defineProps<LabelsDeprecationProps>(), {
  withTooltip: true
})

const sinceTooltip = computed(() => `Deprecated since v${props.since}`)
const removedTooltip = computed(() => `Removed in v${props.removed}`)
</script>

<template>
  <UTooltip :text="sinceTooltip" :disabled="!props.withTooltip">
    <UBadge v-bind="props" :label="props.withTooltip ? props.since : sinceTooltip" color="orange"
      icon="i-tabler-alert-triangle" variant="outline" />
  </UTooltip>
  <UTooltip v-if="props.removed" :text="removedTooltip" :disabled="!props.withTooltip">
    <UBadge v-bind="props" :label="props.withTooltip ? props.removed : removedTooltip" color="error"
      icon="i-tabler-trash" />
  </UTooltip>
</template>
