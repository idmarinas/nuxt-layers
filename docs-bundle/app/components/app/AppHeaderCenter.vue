<script setup lang="ts">
const route = useRoute()

const links = computed(() => [
  {
    label: 'Documentation',
    icon: 'i-tabler-book',
    to: '/getting-started/introduction',
    active: !route.path.includes('/changelog') && !route.path.endsWith('/about') && !route.path.endsWith('/security') && route.path.length > 1,
  },
  {
    label: 'Changelog',
    icon: 'i-tabler-layout',
    to: '/changelog',
    active: route.path.includes('/changelog'),
  },
  {
    label: 'About',
    icon: 'i-tabler-user',
    href: '/about',
    active: route.path.endsWith('/about'),
  },
  {
    label: 'Security Policy',
    icon: 'i-tabler-shield-check',
    href: '/security',
    active: route.path.endsWith('/security'),
  }
])
</script>

<template>
  <UNavigationMenu :items="links" variant="link" />
</template>
