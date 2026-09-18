<script setup lang="ts">
import type { BranchesCollectionItem, Collections } from '@nuxt/content'

const bundle = useAppConfig().docsBundle
const { locale, isEnabled, t } = useBundleI18n()
const collectionName = computed(() => (isEnabled.value ? `branches_${locale.value}` : 'branches'))

interface BranchDownloads {
	branch: string
	version: string
	date: string
	security: boolean
}

const { data: downloads } = await useAsyncData('release-downloads', async () => {
	const query = (await queryCollection(collectionName.value as keyof Collections)
		.where('branch', 'IS NOT NULL')
		.order('branch' as any, 'DESC')
		.all()) as BranchesCollectionItem[]

	const collection = new Set<BranchDownloads>()

	query.forEach(branch => {
		const support = branch.requirements?.support ?? 'none'
		const security = branch.security || false

		const info = bundle.branchesInfo[`b${branch.branch.replaceAll('.', '_')}`]

		// Ramas sin mantenimiento
		if (support === 'none' && !security || !info) return

		collection.add({
			branch: branch.branch,
			security: security,
			version: info.release,
			date: info.date || '',
		})
	})

	return Array.from(collection)
})
</script>

<template>
	<div v-if="downloads?.length" class="space-y-8">
	  <h2 class="text-2xl font-semibold">{{ t('download.title') }}</h2>
		<div class="space-y-4">
			<div v-for="item in downloads" :key="item.branch" class="space-y-3 rounded-lg border border-dashed p-4">
				<div class="flex flex-wrap items-center justify-between gap-3">
					<div class="flex flex-wrap items-center gap-3">
						<UBadge color="neutral" variant="soft" icon="i-tabler-git-branch">{{ item.branch }}</UBadge>
						<UBadge
							v-if="item.security"
							color="warning"
							variant="soft"
							icon="i-tabler-alert-triangle"
							:label="t('download.security_only')"
						/>
						<div class="text-sm text-muted flex items-center gap-4">
							<span class="flex items-center gap-2">
								{{ t('download.latest') }}
								<UIcon name="i-tabler-tag" class="-mr-1" />
								<strong class="text-primary">{{ item.version }}</strong>
							</span>
							<span v-if="item.date" class="flex items-center gap-2">
								<UIcon name="i-tabler-calendar" /> {{ new Date(item.date).toLocaleDateString(locale) }}
							</span>
						</div>
					</div>

					<UButton
						icon="i-tabler-download"
						color="primary"
						:label="t('download.button')"
						:to="`https://github.com/${bundle.package_name}/releases/tag/${item.version}`"
						target="_blank"
					/>
				</div>

				<UAlert
					v-if="item.security"
					color="warning"
					icon="i-tabler-alert-triangle"
					:title="t('download.security_only')"
					:description="t('download.support_ending')"
				/>
			</div>
		</div>
	</div>
</template>
