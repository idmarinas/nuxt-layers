<script lang="ts">
interface Requirements {
  support: string
  [key: string]: string[] | string | undefined
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
const { locale, isEnabled, t } = useBundleI18n()
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
      branch: branch.branch || '0.x',
      security: branch.security || false,
      requirements: branch.requirements || {},
      release: {
        version: info?.release || '',
        date: info?.date || '',
        count: info?.count || 0,
        labels: info?.labels || []
      }
    })
  })

  return Array.from(collection)
})
const data = ref(branches)

const requirementKeys = computed(() => {
  const keys = new Set<string>()

  data.value?.forEach(branch => {
    Object.keys(branch.requirements || {}).forEach(key => {
      if (key !== 'support') keys.add(key)
    })
  })

  return Array.from(keys)
})

const statusColumn: TableColumn<BranchSupport> = {
  id: 'status',
  header: t('table.status'),
  cell: ({ row }) => {
    const supported = row.original.requirements?.support || 'none'
    const security = row.original.security || false

    if ('none' === supported && !security) {
      return h('em', {}, t('label.version.none'))
    } else if ('none' === supported && security) {
      return h('em', {}, t('label.version.security'))
    } else if ('bugs' === supported) {
      return h('em', {}, t('label.version.bug_security'))
    } else if ('features' === supported) {
      return h('em', {}, t('label.version.features'))
    }

    return h('strong', {}, t('table.unknown'))
  }
}

const requirementColumn = (key: string): TableColumn<BranchSupport> => ({
  accessorKey: 'requirements',
  header: t(`table.${key}_version`),
  cell: ({ row }) => {
    const requirement = (row.getValue('requirements') as Requirements)[key]

    if (!requirement || !Array.isArray(requirement) || requirement.length === 0) {
      return h(UBadge, { icon: 'i-tabler-question-mark', color: 'error' })
    }

    const child = new Set<VNode>()

    requirement.forEach(v => child.add(h(UBadge, { color: 'neutral', variant: 'subtle' }, () => v)))
    return h('div', { class: 'flex gap-2' }, Array.from(child))
  }
})

const columns = computed<TableColumn<BranchSupport>[]>(() => [
  {
    id: 'expand',
    cell: ({ row }) =>
      h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        icon: 'i-tabler-chevron-down',
        square: true,
        'aria-label': t('table.expand'),
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
    header: t('table.branch')
  },
  ...requirementKeys.value.map(requirementColumn),
  statusColumn
])

const expanded = ref({ 0: true })
</script>

<template>
  <UTable v-model:expanded="expanded" :data="data" :columns="columns"
    :ui="{ tr: 'data-[expanded=true]:bg-elevated/50' }" class="flex-1">
    <template #expanded="{ row }">
      <div class="flex items-center justify-center gap-3">
        <div>{{ t('table.last_release') }} {{ new Date(row.original.release.date).toLocaleString(locale, { dateStyle: 'full' }) }}</div>
        <LabelsVersion :version="row.original.release.version" />
        <div>{{ t('table.releases_count') }}
          <UBadge color="neutral" variant="outline">{{ row.original.release.count }}</UBadge>
        </div>
      </div>
    </template>
  </UTable>
</template>
