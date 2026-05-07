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
    libraries: [
      {
        title: 'Symfony Components',
        icon: 'i-tabler-brand-symfony',
        to: 'https://www.symfony.com/components',
        description: 'This project relies on these components for most of its features.'
      },
      {
        title: 'Other component',
        icon: 'i-tabler-components',
        to: 'https://www.example.com',
        description: 'Other Component used in this project.'
      }
    ],
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
