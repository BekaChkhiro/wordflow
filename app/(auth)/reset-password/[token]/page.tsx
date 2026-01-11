'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function ResetPasswordPage() {
  const router = useRouter()
  const params = useParams()
  const token = params.token as string

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.password || formData.password.length < 8) {
      newErrors.password = 'პაროლი უნდა იყოს მინიმუმ 8 სიმბოლო'
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'პაროლი უნდა შეიცავდეს დიდ ასოს'
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = 'პაროლი უნდა შეიცავდეს ციფრს'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'პაროლები არ ემთხვევა'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) return

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'შეცდომა')
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch {
      setError('შეცდომა. სცადეთ თავიდან.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">პაროლი შეიცვალა!</h1>
        <p className="text-gray-600">გადამისამართდებით შესვლის გვერდზე...</p>
      </Card>
    )
  }

  return (
    <Card className="p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">ახალი პაროლი</h1>
        <p className="text-gray-600">შეიყვანეთ ახალი პაროლი</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="password"
          name="password"
          type="password"
          label="ახალი პაროლი"
          placeholder="მინიმუმ 8 სიმბოლო"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          disabled={isLoading}
        />

        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          label="გაიმეორეთ პაროლი"
          placeholder="პაროლის დადასტურება"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          disabled={isLoading}
        />

        <Button type="submit" className="w-full" isLoading={isLoading}>
          პაროლის შეცვლა
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        <Link href="/login" className="text-blue-600 hover:underline font-medium">
          შესვლის გვერდზე დაბრუნება
        </Link>
      </p>
    </Card>
  )
}
