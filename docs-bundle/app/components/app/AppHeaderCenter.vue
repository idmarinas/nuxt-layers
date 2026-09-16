<script setup lang="ts">
const route = useRoute()

const {t} = useBundleI18n()

const links = computed(() => [
  {
    label: t('navigation.documentation'),
    icon: 'i-tabler-book',
    to: '/getting-started/introduction',
    active: !route.path.includes('/changelog') && !route.path.endsWith('/about') && !route.path.endsWith('/security') && route.path.length > 1,
  },
  {
    label: t('navigation.changelog'),
    icon: 'i-tabler-layout',
    to: '/changelog',
    active: route.path.includes('/changelog'),
  },
  {
    label: t('navigation.about'),
    icon: 'i-tabler-user',
    href: '/about',
    active: route.path.endsWith('/about'),
  },
  {
    label: t('navigation.security_policy'),
    icon: 'i-tabler-shield-check',
    href: '/security',
    active: route.path.endsWith('/security'),
  }
])
</script>

<template>
  <UNavigationMenu :items="links" variant="link" />
</template>
