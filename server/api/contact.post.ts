import { Resend } from 'resend'
import { getRuntimeEnv } from '../utils/runtime-env'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { name, email, phone, message } = body

  if (!name || !email || !message) {
    throw createError({ statusCode: 400, message: 'Name, email, and message are required.' })
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
      ].filter(Boolean).join('\n'),
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
