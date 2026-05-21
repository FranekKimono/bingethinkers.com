// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/content'],

  nitro: {
    preset: 'cloudflare-pages',
    prerender: {
      crawlLinks: true,
      routes: [
        '/',
        '/how-it-works',
        '/pricing',
        '/about',
        '/contact',
        '/faq',
        '/gallery',
        '/privacy',
      ],
    },
  },

  content: {
    highlight: false,
    markdown: {
      remarkPlugins: [],
      rehypePlugins: [],
    },
  },

  app: {
    head: {
      title: 'Binge Thinkers — Trivia Nights',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Book a live trivia night for your bar, pub, or event. Professional hosts bring the fun — you bring the crowd.' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon/favicon.svg' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon/favicon-16x16.png' },
        { rel: 'shortcut icon', href: '/favicon/favicon.ico' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/favicon/apple-touch-icon.png' },
        { rel: 'manifest', href: '/favicon/site.webmanifest' },
      ],
    },
  },

  css: ['~/assets/css/main.css'],

  compatibilityDate: '2024-11-01',
})
