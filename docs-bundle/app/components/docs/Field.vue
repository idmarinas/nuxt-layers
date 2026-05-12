<script setup lang="ts">
const props = defineProps<{
  since?: string
  deprecated?: {
    since: string
    removed?: string
  }
}>()

const slots = defineSlots<{
  default?(): any
}>()

// Mostrar badge según estado
const showSinceBadge = computed(() => !!props.since && !props.deprecated)
const showDeprecatedBadge = computed(() => !!props.deprecated)
</script>

<template>
  <!-- Header con nombre, tipo y badges -->
  <div class="absolute w-full -mt-8 flex items-center justify-end gap-2 flex-wrap pb-2">
    <!-- Badges a la derecha -->
    <div class="flex items-center gap-2">
      <!-- Badge since -->
      <LabelsVersion v-if="showSinceBadge" :version="since as string" size="sm" />

      <!-- Badge deprecated -->
      <template v-if="showDeprecatedBadge">
        <LabelsDeprecation :since="deprecated?.since as string" :removed="deprecated?.removed" size="sm" />
      </template>
    </div>
  </div>

  <!-- Contenido (descripción, default value, etc) -->
  <slot mdc-unwrap="p">
    <slot />
  </slot>
</template>
