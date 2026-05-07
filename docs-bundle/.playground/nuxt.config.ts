export default defineNuxtConfig({
  extends: ['..', 'docus'],
  devtools: {enabled: true},
  docsBundle: {
    // package_name: 'idmarinas/template-bundle',
    socials: {
      x: 'https://x.com/idmarinas',
      reddit: 'https://reddit.com/u/idmarinas',
      paypal: 'https://www.paypal.me/idmarinas',
      bitly: 'https://bit.ly/m/idmarinas',
      githubsponsors: 'https://github.com/sponsors/idmarinas',
      linkedin: 'https://linkedin.com/in/idmarinas',
    },
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
