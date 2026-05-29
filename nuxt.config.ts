// https://nuxt.com/docs/api/configuration/nuxt-config
import { access, mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

/** Pre-seed app manifest before Vite SSR build (avoids #app-manifest resolve race in dev). */
async function ensureAppManifest(buildDir: string, buildId: string) {
  const manifestPath = join(buildDir, 'manifest', 'meta', `${buildId}.json`)
  try {
    await access(manifestPath)
  } catch {
    await mkdir(join(buildDir, 'manifest', 'meta'), { recursive: true })
    await writeFile(
      manifestPath,
      JSON.stringify({ id: buildId, timestamp: Date.now(), prerendered: [] }),
    )
  }
}

export default defineNuxtConfig({
  modules: ['@nuxt/content', '@nuxt/image'],

  hooks: {
    ready: async (nuxt) => {
      if (!nuxt.options.experimental.appManifest) return
      const buildId = nuxt.options.dev ? 'dev' : nuxt.options.buildId
      await ensureAppManifest(nuxt.options.buildDir, buildId)
    },
  },

  routeRules: {
    '/about': { redirect: '/our-story' },
    '/pricing': { redirect: '/contact' },
    '/how-it-works': { redirect: '/' },
    '/gallery': { redirect: '/testimonials' },
  },

  nitro: {
    preset: 'cloudflare-pages',
    prerender: {
      crawlLinks: true,
      routes: [
        '/',
        '/our-story',
        '/testimonials',
        '/contact',
        '/faq',
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

  image: {
    provider: 'ipx',
    format: ['webp', 'png', 'jpg'],
    screens: {
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
    },
  },

  css: ['~/assets/css/main.css'],

  compatibilityDate: '2024-11-01',
})
