'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import GoogleButton from '@/components/auth/GoogleButton'

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'შეიყვანეთ სწორი ელ-ფოსტა'
    }

    if (!formData.password) {
      newErrors.password = 'შეიყვანეთ პაროლი'
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
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        setError('არასწორი ელ-ფოსტა ან პაროლი')
      } else {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch {
      setError('შესვლის შეცდომა. სცადეთ თავიდან.')
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

  return (
    <Card className="p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">WordFlow</h1>
        <p className="text-gray-600">შედით თქვენს ანგარიშში</p>
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
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          disabled={isLoading}
        />

        <Input
          id="password"
          name="password"
          type="password"
          label="პაროლი"
          placeholder="თქვენი პაროლი"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          disabled={isLoading}
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-600">დამახსოვრება</span>
          </label>
          <Link
            href="/forgot-password"
            className="text-sm text-blue-600 hover:underline"
          >
            დაგავიწყდათ პაროლი?
          </Link>
        </div>

        <Button type="submit" className="w-full" isLoading={isLoading}>
          შესვლა
        </Button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">ან</span>
          </div>
        </div>

        <div className="mt-4">
          <GoogleButton />
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-gray-600">
        არ გაქვთ ანგარიში?{' '}
        <Link href="/register" className="text-blue-600 hover:underline font-medium">
          რეგისტრაცია
        </Link>
      </p>
    </Card>
  )
}
