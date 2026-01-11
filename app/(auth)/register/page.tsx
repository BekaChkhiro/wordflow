'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import GoogleButton from '@/components/auth/GoogleButton'

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name || formData.name.length < 2) {
      newErrors.name = 'სახელი უნდა იყოს მინიმუმ 2 სიმბოლო'
    }

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'შეიყვანეთ სწორი ელ-ფოსტა'
    }

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
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'რეგისტრაციის შეცდომა')
        return
      }

      // Auto login after registration
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        router.push('/login')
      } else {
        router.push('/dashboard')
      }
    } catch {
      setError('რეგისტრაციის შეცდომა. სცადეთ თავიდან.')
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
        <p className="text-gray-600">შექმენით ანგარიში და დაიწყეთ სწავლა</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="name"
          name="name"
          type="text"
          label="სახელი"
          placeholder="თქვენი სახელი"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          disabled={isLoading}
        />

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
          რეგისტრაცია
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
        უკვე გაქვთ ანგარიში?{' '}
        <Link href="/login" className="text-blue-600 hover:underline font-medium">
          შესვლა
        </Link>
      </p>
    </Card>
  )
}
