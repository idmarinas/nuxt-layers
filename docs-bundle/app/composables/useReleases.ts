import type { Collections, ChangelogVCollectionItem } from '@nuxt/content'

export const useReleases = async () => {
  const { locale, isEnabled } = useDocusI18n()

  const collectionName = computed(() => isEnabled.value ? `changelog_v_${locale.value}` : 'changelog_v')

  const { data: lastRelease } = await useAsyncData('last_release', () => queryCollection(collectionName.value as keyof Collections)
    .order('date' as any, 'DESC')
    .where('date', 'IS NOT NULL')
    .where('date', 'NOT LIKE', '%y%')
    .first() as Promise<ChangelogVCollectionItem>
  )

  return { lastRelease }
}

