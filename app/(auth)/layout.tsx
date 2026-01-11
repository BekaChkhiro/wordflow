import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'WordFlow - ავთენტიფიკაცია',
  description: 'შედით ან დარეგისტრირდით WordFlow-ზე',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  )
}
