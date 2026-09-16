import { useNuxtApp, useRuntimeConfig } from '#imports'
import type { LocaleObject } from '@nuxtjs/i18n'
import type { Ref } from 'vue'
import { ref } from 'vue'

type BundleNuxtApp = ReturnType<typeof useNuxtApp> & {
  $i18n?: {
    locale: Ref<string>
    t: (key: string, params?: Record<string, string | number>) => string
  }
  $locale?: string
  $bundleLocaleMessages?: Record<string, unknown>
  $localeMessages?: Record<string, unknown>
  $localePath?: (path: string) => string
  $switchLocalePath?: (locale?: string) => string
}

const getByPath = (messages: Record<string, unknown>, key: string): unknown =>
  key.split('.').reduce<unknown>((acc, current) => (acc as Record<string, unknown> | undefined)?.[current], messages)

const interpolate = (message: string, params?: Record<string, string | number>): string =>
  message.replace(/\{(\w+)\}/g, (_, name: string) => (params?.[name] != null ? String(params[name]) : `{${name}}`))

export const useBundleI18n = () => {
  const config = useRuntimeConfig().public
  const nuxtApp = useNuxtApp() as BundleNuxtApp
  const isEnabled = ref(!!config.i18n)

  if (!isEnabled.value) {
    const locale = nuxtApp.$locale || 'en'
    const bundleMessages = nuxtApp.$bundleLocaleMessages || {}
    const localeMessages = nuxtApp.$localeMessages || {}

    const t = (key: string, params?: Record<string, string | number>): string => {
      const raw = getByPath(bundleMessages, key) ?? getByPath(localeMessages, key)

      return typeof raw === 'string' ? interpolate(raw, params) : key
    }

    return {
      isEnabled,
      locale: ref(locale),
      locales: [],
      localePath: (path: string) => path,
      switchLocalePath: () => {},
      t,
    }
  }

  const locale = nuxtApp.$i18n?.locale || ref('en')
  const t = nuxtApp.$i18n?.t || ((key: string) => key)
  const filteredLocales = (config.docus as { filteredLocales: LocaleObject<string>[] })?.filteredLocales || []

  return {
    isEnabled,
    locale,
    locales: filteredLocales,
    t,
    localePath: nuxtApp.$localePath || ((path: string) => path),
    switchLocalePath: nuxtApp.$switchLocalePath || (() => ''),
  }
}
