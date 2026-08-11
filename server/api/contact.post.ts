import { Resend } from 'resend'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { name, email, phone, message } = body

  if (!name || !email || !message) {
    throw createError({ statusCode: 400, message: 'Name, email, and message are required.' })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)

  const { error } = await resend.emails.send({
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

  if (error) {
    console.error('Resend error:', error)
    throw createError({ statusCode: 500, message: 'Failed to send message.' })
  }

  return { success: true }
})
