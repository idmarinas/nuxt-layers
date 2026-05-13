<script lang="ts" setup>
const props = defineProps<{
  title: string
  description?: string
  since?: string
  deprecated?: {
    since: string
    removed?: string
  }
}>()

const slots = defineSlots<{
  links?(): any
  headline?(): any
  title?(): any
}>()

// Determinar si mostrar solo deprecated o ambos
const showDeprecatedBanner = computed(() => !!props.deprecated)
const showSinceBadge = computed(() => !!props.since && !props.deprecated)
</script>

<template>
  <!-- Banner de deprecated que envuelve todo -->
  <div v-if="showDeprecatedBanner"
    class="rounded-lg p-3 mt-8 mb-3 bg-linear-to-r from-orange-50/50 to-transparent dark:from-orange-950/10 dark:to-transparent border-l-4 border-orange-300 dark:border-orange-700 border-orange-200 dark:border-orange-800/50">
    <!-- Badges de deprecated/removed en la parte superior -->
    <div class="flex flex-wrap items-center justify-between gap-2 -mb-4.5">
      <LabelsDeprecation :since="deprecated?.since as string" :removed="deprecated?.removed" :with-tooltip="false" />
    </div>

    <!-- UPageHeader dentro del banner deprecated -->
    <UPageHeader :description="description" :title="title" :ui="{
      wrapper: 'flex-row items-center flex-wrap justify-between gap-2',
      root: 'border-0 pt-8 pb-6'
    }">
      <template v-if="$slots.links" #links>
        <slot name="links" />
      </template>
      <template v-if="$slots.headline" #headline>
        <slot name="headline" />
      </template>
      <template v-if="$slots.title" #title>
        <slot name="title" />
      </template>
    </UPageHeader>
  </div>

  <!-- UPageHeader normal con badge "since" a la derecha del headline -->
  <div v-else>
    <UPageHeader :description="description" :title="title" :ui="{
      wrapper: 'flex-row items-center flex-wrap justify-between gap-2',
    }">
      <template v-if="$slots.headline" #headline>
        <slot name="headline" />
        <div class="flex-1" />
        <LabelsVersion v-if="showSinceBadge" :version="since as string" isNew />
      </template>
      <template v-if="$slots.links" #links>
        <slot name="links" />
      </template>
      <template v-if="$slots.title" #title>
        <slot name="title" />
      </template>
    </UPageHeader>
  </div>
</template>
