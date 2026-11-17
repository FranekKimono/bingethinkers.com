import { Resend } from 'resend'
import { getRuntimeEnv } from '../utils/runtime-env'

const LIMITS = { name: 120, email: 254, phone: 40, message: 5000 }

/** Trimmed single-line text; control characters (including CR/LF) are removed. */
function line(value: unknown, max: number): string | null {
  if (value == null) return ''
  if (typeof value !== 'string') return null
  const text = value.replace(/[\u0000-\u001f\u007f]+/g, ' ').trim()
  return text.length <= max ? text : null
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => null)
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw createError({ statusCode: 400, message: 'Invalid request.' })
  }

  // Honeypot: real visitors never see or fill this field. Pretend it worked.
  if (typeof body.confirm === 'string' && body.confirm.trim()) {
    return { success: true }
  }

  const name = line(body.name, LIMITS.name)
  const email = line(body.email, LIMITS.email)
  const phone = line(body.phone, LIMITS.phone)
  const message =
    typeof body.message === 'string' && body.message.trim().length <= LIMITS.message
      ? body.message.trim()
      : null

  if (!name || !email || !message || phone === null) {
    throw createError({ statusCode: 400, message: 'Name, email, and message are required.' })
  }
  if (!/^[^\s@<>,;"]+@[^\s@<>,;"]+\.[^\s@<>,;"]+$/.test(email)) {
    throw createError({ statusCode: 400, message: 'Please enter a valid email address.' })
  }

  const apiKey = getRuntimeEnv(event, 'RESEND_API_KEY')
  if (!apiKey) {
    console.error('RESEND_API_KEY is not configured')
    throw createError({ statusCode: 503, message: 'Email service is temporarily unavailable.' })
  }

  const resend = new Resend(apiKey)

  let sendError

  try {
    const result = await resend.emails.send({
      from: 'Binge Thinkers <contact@bingethinkers.com>',
      to: 'info@bingethinkers.com',
      replyTo: email,
      subject: `New inquiry from ${name}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        phone ? `Phone: ${phone}` : null,
        ``,
        `Message:`,
        message,
      ].filter((part) => part !== null).join('\n'),
    })

    sendError = result.error
  } catch (error) {
    console.error('Unexpected contact form error:', error)
    throw createError({ statusCode: 500, message: 'Failed to send message.' })
  }

  if (sendError) {
    console.error('Resend error:', sendError)
    throw createError({ statusCode: 500, message: 'Failed to send message.' })
  }

  return { success: true }
})
