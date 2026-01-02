<script setup lang="ts">
const bundle = useAppConfig().docsBundle
const props = defineProps({
  n: {
    type: String,
    default: ''
  },
  text: {
    type: String,
    default: ''
  }
})
const content = computed((): string => {
  if (!props.n) return ''

  if ('project' === props.n) {
    return bundle.name
  }

  const repo = `https://github.com/${bundle.package_name}`

  const keys = props.n.split('.')
  let value: any = {
    project: {
      name: bundle.name,
      description: bundle.description
    },
    package_name: bundle.package_name,
    repository: repo,
    security_advisories_url: `${repo}/security/advisories`,
    ...bundle.vars,
  }

  for (const key of keys) {
    value = value?.[key]
  }

  return value || ''
})

function isUrl(str: string): boolean {
  try {
    new URL(str)
    return true
  } catch {
    return false
  }
}

</script>
<template>
  <MDC v-if="isUrl(content) && text" :value="`[${text}](${content})`" :tag="false" :unwrap="true" />
  <span v-else>{{ content }}</span>
</template>
