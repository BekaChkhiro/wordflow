import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import SettingsForm from '@/components/settings/SettingsForm'

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: {
      id: true,
      name: true,
      email: true,
      dailyGoal: true,
      currentLevel: true,
    },
  })

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">პარამეტრები</h1>
        <p className="text-gray-600">მართე შენი ანგარიშის პარამეტრები</p>
      </div>

      <SettingsForm user={user} />
    </div>
  )
}
