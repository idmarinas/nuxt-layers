export default defineNuxtConfig({
  extends: ['..', 'docus'],
  devtools: {enabled: true},
  docsBundle: {
    // package_name: 'idmarinas/template-bundle',
  },
  vite: {
    optimizeDeps: {
      include: [
        '@vue/devtools-core',
        '@vue/devtools-kit',
      ]
    }
  }
})
