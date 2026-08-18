import type { H3Event } from 'h3'

interface CloudflareEventContext {
  _platform?: {
    cloudflare?: {
      env?: Record<string, unknown>
    }
  }
}

export function getRuntimeEnv(event: H3Event, key: string): string | undefined {
  const context = event.context as CloudflareEventContext
  const cloudflareValue = context._platform?.cloudflare?.env?.[key]

  if (typeof cloudflareValue === 'string') {
    return cloudflareValue
  }

  return process.env[key]
}
