export default defineAppConfig({
  ui: {
    colors: { primary: 'blue', secondary: 'sky', neutral: 'stone' },
    prose: {
      field: {
        slots: {
          description: 'relative',
        }
      }
    }
  },
  github: { rootDir: 'docs' },
  navigation: {
    sub: 'aside', // header or 'aside'
  },
})

