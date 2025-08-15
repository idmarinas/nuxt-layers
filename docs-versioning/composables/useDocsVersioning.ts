import {Version} from '../utils/version'

export default function () {
  const route = useRoute()
  const appConfig = useAppConfig()
  const isEnabled = appConfig.docsVersioning.enable
  const versions: Version[] = appConfig.docsVersioning.versions

  if (!isEnabled) {
    return {
      items: ref([]),
      version: ref(new Version('0.0.0', {major: 0, minor: 0, patch: 0}, true)),
      versions,
      isEnabled,
      collectionName: ref('docs_versioning')
    }
  }

  const version: Version = computed(() => {
    return versions.find(v => v.path === `/${route.params.v}`) || versions.find(v => v.isCurrent) || versions[0]
  })

  const items = computed(() => versions.map(v => ({
    ...v,
    ...(v.path === version.value.path
        ? {checked: true, color: v.tagColor, type: 'checkbox' as const}
        : {to: route.path.replace(version.value.path, v.path)}
    )
  })))

  const collectionName = computed(() => version.value.collection)

  return {
    items,
    version,
    versions,
    collectionName,
    isEnabled,
  }
}
