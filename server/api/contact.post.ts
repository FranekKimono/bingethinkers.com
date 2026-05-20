export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { name, email, phone, message } = body

  // Validate
  if (!name || !email || !message) {
    throw createError({ statusCode: 400, message: 'Name, email, and message are required.' })
  }

  // TODO: Replace with your preferred email delivery:
  //   - Resend (resend.com) — free tier, great DX
  //   - Mailchannels (free for Cloudflare Workers)
  //   - SendGrid / Mailgun
  //
  // Example with Resend:
  //   import { Resend } from 'resend'
  //   const resend = new Resend(process.env.RESEND_API_KEY)
  //   await resend.emails.send({
  //     from: 'contact@bingethinkers.com',
  //     to: 'info@bingethinkers.com',
  //     subject: `New inquiry from ${name}`,
  //     text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\n\n${message}`,
  //   })

  // For now, log to console (visible in Cloudflare Worker logs)
  console.log('Contact form submission:', { name, email, phone, message })

  return { success: true }
})
