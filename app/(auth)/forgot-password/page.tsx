'use client'

import { useState } from 'react'
import Link from 'next/link'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('შეიყვანეთ სწორი ელ-ფოსტა')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'შეცდომა')
        return
      }

      setSuccess(true)
    } catch {
      setError('შეცდომა. სცადეთ თავიდან.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">შეამოწმეთ ელ-ფოსტა</h1>
        <p className="text-gray-600 mb-6">
          თუ ეს ელ-ფოსტა რეგისტრირებულია, გამოგიგზავნეთ პაროლის აღდგენის ბმული.
        </p>
        <Link href="/login">
          <Button variant="outline">შესვლის გვერდზე დაბრუნება</Button>
        </Link>
      </Card>
    )
  }

  return (
    <Card className="p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">პაროლის აღდგენა</h1>
        <p className="text-gray-600">
          შეიყვანეთ თქვენი ელ-ფოსტა და გამოგიგზავნით აღდგენის ბმულს
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="email"
          name="email"
          type="email"
          label="ელ-ფოსტა"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
        />

        <Button type="submit" className="w-full" isLoading={isLoading}>
          ბმულის გაგზავნა
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        გახსოვთ პაროლი?{' '}
        <Link href="/login" className="text-blue-600 hover:underline font-medium">
          შესვლა
        </Link>
      </p>
    </Card>
  )
}
