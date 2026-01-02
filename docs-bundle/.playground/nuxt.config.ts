export default defineNuxtConfig({
  extends: ['..', 'docus'],
  devtools: { enabled: true },
  docsBundle: {
    // package_name: 'idmarinas/template-bundle',
    versions: ['1.0']
  }
})
