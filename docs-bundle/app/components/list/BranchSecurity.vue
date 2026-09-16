<script lang="ts">
interface Security {
  branch: string
  security: boolean
  date?: string
  release?: string
}
</script>

<script setup lang="ts">
import type { BranchesCollectionItem, Collections } from '@nuxt/content'
import type { TableColumn } from '@nuxt/ui'

import { h, resolveComponent } from 'vue'

const LabelsVersion = resolveComponent('LabelsVersion')
const UBadge = resolveComponent('UBadge')

const bundle = useAppConfig().docsBundle
const { locale, isEnabled, t } = useBundleI18n()
const collectionName = computed(() => isEnabled.value ? `branches_${locale.value}` : 'branches')

const { data: branches } = await useAsyncData('security-policy', async () => {
  const query = await queryCollection(collectionName.value as keyof Collections)
    .where('branch', 'IS NOT NULL')
    .order('branch' as any, 'DESC')
    .all() as BranchesCollectionItem[]

  const collection = new Set<Security>()

  query.forEach(branch => {
    const info = bundle.branchesInfo[`b${branch.branch.replaceAll('.', '_')}`]
    collection.add({
      branch: branch.branch || '',
      security: branch.security || false,
      date: info?.date || '',
      release: info?.release || ''
    })
  })

  return Array.from(collection)
})
const data = ref(branches)

const columns: TableColumn<Security>[] = [
  {
    accessorKey: 'branch',
    header: t('table.branch'),
    cell: ({ row }) => row.getValue('branch')
  },
  {
    accessorKey: 'security',
    header: t('table.security'),
    cell: ({ row }) => {
      const color = {
        true: 'success' as const,
        false: 'error' as const,
      }[row.getValue('security') as string]

      const icon = {
        true: 'i-tabler-check' as const,
        false: 'i-tabler-x' as const,
      }[row.getValue('security') as string]

      return h(UBadge, { class: 'capitalize', variant: 'subtle', color, icon })
    }
  },
  {
    accessorKey: 'date',
    header: t('table.last_release_date'),
    cell: ({ row }) => {
      return new Date(row.getValue('date')).toLocaleString(locale.value, { dateStyle: 'long' })
    }
  },
  {
    accessorKey: 'release',
    header: t('table.last_release'),
    cell: ({ row }) => {
      return h(LabelsVersion, { version: row.getValue('release') })
    }
  }
]
</script>

<template>
  <UTable :data="data" :columns="columns" class="flex-1" />
</template>
