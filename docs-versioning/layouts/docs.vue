<template>
  <UContainer>
    <UPage>
      <template #left>
        <UPageAside>
          <DocsAsideLeftTop />

          <AppHeaderBody />
        </UPageAside>
      </template>

      <slot />
    </UPage>
  </UContainer>
</template>
