export default defineNuxtRouteMiddleware((to, from) => {
  const nuxtApp = useNuxtApp()
  const localeIsEnabled = !!nuxtApp.$i18n
  const locale = nuxtApp.$i18n?.locale
  const versioningIsEnabled = nuxtApp._appConfig.docsVersioning.enable
  const params = to.params

  let localeChanged = false
  let versionChanged = false

  if (params.lang !== '' && localeIsEnabled) {
    if (nuxtApp.$i18n.locales.value.find(l => l.code === params.lang)) {
      nuxtApp.$i18n.setLocale(params.lang)
    } else {
      params.lang = locale.value
      localeChanged = true
    }
  } else if (params.lang === '' && localeIsEnabled) {
    params.lang = locale.value
    localeChanged = true
  } else if (params.lang !== '' && !localeIsEnabled) {
    params.lang = ''
    localeChanged = true
  }

  if (params.v === '' && versioningIsEnabled) {
    params.v = 'current'
    versionChanged = true
  } else if (params.v !== '' && !versioningIsEnabled) {
    params.v = ''
    versionChanged = true
  }

  if (localeChanged || versionChanged) {
    return navigateTo({name: to.name, params})
  }
})
