<script lang="ts" setup>
const {version, items} = useDocsVersioning()
</script>

<template>
  <UDropdownMenu
    :items="items"
    :modal="false"
    :ui="{
      content: 'w-(--reka-dropdown-menu-trigger-width) min-w-0'
    }"
  >
    <template #default="{ open }">
      <UButton
        :class="[open && 'bg-elevated']"
        :ui="{
          trailingIcon: ['transition-transform duration-200', open ? 'rotate-180' : undefined].filter(Boolean).join(' ')
        }"
        block
        color="neutral"
        size="md"
        trailing-icon="i-lucide-chevron-down"
        variant="outline"
      >
        <span class="truncate">{{ version.label }}</span>

        <UBadge :color="version.tagColor" class="rounded-full" size="sm" variant="subtle">
          {{ version.tag }}
        </UBadge>
      </UButton>
    </template>

    <template #item-label="{ item }">
      <div class="flex items-center gap-1.5">
        <span class="truncate">{{ item.label }}</span>

        <UBadge :color="item.tagColor" class="rounded-full" size="sm" variant="subtle">
          {{ item.tag }}
        </UBadge>
      </div>
    </template>
  </UDropdownMenu>
</template>
