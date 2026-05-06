<template>
  <UMain>
    <UContainer>
      <UPage>
        <template #left>
          <UPageAside>
            <DocsAsideLeftTop />

            <UContentSearchButton :collapsed="false" variant="soft" :ui="{ leadingIcon: 'size-4 mr-1' }" class="w-full" />
            <USeparator class="my-4" type="dashed" />

            <DocsAsideLeftBody />
          </UPageAside>
        </template>
        <slot />
      </UPage>
    </UContainer>
  </UMain>
</template>
