<script lang="ts">
interface Requirements {
  php: string[]
  symfony: string[]
  support: string
}

interface BranchSupport {
  branch: string
  security: boolean
  requirements: Requirements
  release: {
    version: string
    date: string
    count: number
    labels: string[]
  }
}
</script>

<script setup lang="ts">
import type { BranchesCollectionItem, Collections } from '@nuxt/content'
import type { TableColumn } from '@nuxt/ui'

import { h, resolveComponent, type VNode } from 'vue'

const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')

const bundle = useAppConfig().docsBundle
const { locale, isEnabled } = useDocusI18n()
const collectionName = computed(() => isEnabled.value ? `branches_${locale.value}` : 'branches')

const { data: branches } = await useAsyncData('branches-support', async () => {
  const query = await queryCollection(collectionName.value as keyof Collections)
    .where('branch', 'IS NOT NULL')
    .order('branch' as any, 'DESC')
    .all() as BranchesCollectionItem[]

  const collection = new Set<BranchSupport>()

  query.forEach(branch => {
    const info = bundle.branchesInfo[`b${branch.branch.replaceAll('.', '_')}`]

    collection.add({
      branch: branch.branch,
      security: branch.security,
      requirements: branch.requirements,
      release: {
        version: String(info?.release),
        date: String(info?.date),
        count: Number(info?.count),
        labels: info?.labels || []
      }
    })
  })

  return Array.from(collection)
})
const data = ref(branches)

const columns: TableColumn<BranchSupport>[] = [
  {
    id: 'expand',
    cell: ({ row }) =>
      h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        icon: 'i-tabler-chevron-down',
        square: true,
        'aria-label': 'Expand',
        ui: {
          leadingIcon: [
            'transition-transform',
            row.getIsExpanded() ? 'duration-200 rotate-180' : ''
          ]
        },
        onClick: () => row.toggleExpanded()
      })
  },
  {
    accessorKey: 'branch',
    header: 'Branch'
  },
  {
    accessorKey: 'requirements',
    header: 'PHP Version',
    cell: ({ row }) => {
      const requirements: Requirements = row.getValue('requirements')

      const child = new Set<VNode>()

      requirements.php.forEach(v => child.add(h(UBadge, { color: 'neutral', variant: 'subtle' }, () => v)))
      return h('div', { class: 'flex gap-2' }, Array.from(child))
    }
  },
  {
    accessorKey: 'requirements',
    header: 'Symfony Version',
    cell: ({ row }) => {
      const requirements: Requirements = row.getValue('requirements')

      const child = new Set<VNode>()

      requirements.symfony.forEach(v => child.add(h(UBadge, { color: 'neutral', variant: 'subtle' }, () => v)))
      return h('div', { class: 'flex gap-2' }, Array.from(child))
    }
  },
  {
    id: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const supported = String(row.original.requirements.support)
      const security = Boolean(row.original.security)

      if ('none' === supported && !security) {
        return h('em', {}, 'No longer maintained')
      } else if ('none' === supported && security) {
        return h('em', {}, 'Security fixes only')
      } else if ('bugs' === supported) {
        return h('em', {}, 'Bug and security fixes')
      } else if ('features' === supported) {
        return h('em', {}, 'New features bug and security fixes')
      }

      return h('strong', {}, 'Unknown')
    }
  }
]

const expanded = ref({ 0: true })
</script>

<template>
  <UTable v-model:expanded="expanded" :data="data" :columns="columns"
    :ui="{ tr: 'data-[expanded=true]:bg-elevated/50' }" class="flex-1">
    <template #expanded="{ row }">
      <div class="flex items-center justify-center gap-3">
        <div>Last Release {{ new Date(row.original.release.date).toLocaleString(locale, { dateStyle: 'full' }) }}</div>
        <LabelsVersion :version="row.original.release.version" />
        <div>Releases count
          <UBadge color="neutral" variant="outline">{{ row.original.release.count }}</UBadge>
        </div>
      </div>
    </template>
  </UTable>
</template>
