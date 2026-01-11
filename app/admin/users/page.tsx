import prisma from '@/lib/prisma'
import UsersTable from '@/components/admin/UsersTable'

interface PageProps {
  searchParams: Promise<{ page?: string; search?: string }>
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const { page = '1', search } = await searchParams
  const currentPage = parseInt(page)
  const perPage = 20

  // Build where clause
  const where: any = {}
  if (search) {
    where.OR = [
      { email: { contains: search, mode: 'insensitive' } },
      { name: { contains: search, mode: 'insensitive' } },
    ]
  }

  // Get users with pagination
  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (currentPage - 1) * perPage,
      take: perPage,
      select: {
        id: true,
        email: true,
        name: true,
        totalXp: true,
        streak: true,
        currentLevel: true,
        isAdmin: true,
        createdAt: true,
        lastActiveAt: true,
        _count: {
          select: {
            progress: { where: { learned: true } },
            mistakes: true,
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ])

  const totalPages = Math.ceil(totalCount / perPage)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">მომხმარებლები</h1>
          <p className="text-gray-600">სულ: {totalCount} მომხმარებელი</p>
        </div>
      </div>

      <UsersTable
        users={users}
        totalPages={totalPages}
        currentPage={currentPage}
        search={search}
      />
    </div>
  )
}
