import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import prisma from '@/lib/prisma'
import { forgotPasswordSchema } from '@/lib/validations/auth'
import { sendPasswordResetEmail } from '@/lib/email/resend'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const result = forgotPasswordSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      )
    }

    const { email } = result.data

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    })

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        message: 'თუ ეს ელ-ფოსტა რეგისტრირებულია, მიიღებთ აღდგენის ბმულს',
      })
    }

    // Delete any existing tokens for this email
    await prisma.passwordResetToken.deleteMany({
      where: { email },
    })

    // Generate token
    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Save token
    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expires,
      },
    })

    // Send email
    await sendPasswordResetEmail(email, token)

    return NextResponse.json({
      message: 'თუ ეს ელ-ფოსტა რეგისტრირებულია, მიიღებთ აღდგენის ბმულს',
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'შეცდომა. სცადეთ თავიდან.' },
      { status: 500 }
    )
  }
}
