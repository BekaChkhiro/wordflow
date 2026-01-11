import { Resend } from 'resend'

const resendApiKey = process.env.RESEND_API_KEY

export const resend = resendApiKey ? new Resend(resendApiKey) : null

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password/${token}`

  if (!resend) {
    console.log('Resend not configured. Reset URL:', resetUrl)
    return { success: true, devMode: true }
  }

  try {
    await resend.emails.send({
      from: 'WordFlow <onboarding@resend.dev>',
      to: email,
      subject: 'პაროლის აღდგენა - WordFlow',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">WordFlow</h1>
          <h2>პაროლის აღდგენა</h2>
          <p>თქვენ მოითხოვეთ პაროლის აღდგენა. დააჭირეთ ქვემოთ მოცემულ ღილაკს ახალი პაროლის დასაყენებლად:</p>
          <a href="${resetUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">
            პაროლის აღდგენა
          </a>
          <p style="color: #666; font-size: 14px;">ეს ბმული მოქმედებს 1 საათის განმავლობაში.</p>
          <p style="color: #666; font-size: 14px;">თუ თქვენ არ მოგითხოვიათ პაროლის აღდგენა, უგულებელყოთ ეს წერილი.</p>
        </div>
      `,
    })
    return { success: true }
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, error }
  }
}
