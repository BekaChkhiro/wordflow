import prisma from '@/lib/prisma'
import PhrasesTable from '@/components/admin/PhrasesTable'

interface PageProps {
  searchParams: Promise<{ level?: string; category?: string; page?: string; search?: string }>
}

export default async function AdminPhrasesPage({ searchParams }: PageProps) {
  const { level, category, page = '1', search } = await searchParams
  const currentPage = parseInt(page)
  const perPage = 20

  // Build where clause
  const where: any = {}
  if (level) where.level = level
  if (category) where.category = category
  if (search) {
    where.OR = [
      { english: { contains: search, mode: 'insensitive' } },
      { georgian: { contains: search, mode: 'insensitive' } },
    ]
  }

  // Get phrases with pagination
  const [phrases, totalCount, categories] = await Promise.all([
    prisma.phrase.findMany({
      where,
      orderBy: { id: 'desc' },
      skip: (currentPage - 1) * perPage,
      take: perPage,
    }),
    prisma.phrase.count({ where }),
    prisma.phrase.findMany({
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    }),
  ])

  const totalPages = Math.ceil(totalCount / perPage)
  const allCategories = categories.map((c) => c.category)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ფრაზების მართვა</h1>
          <p className="text-gray-600">სულ: {totalCount} ფრაზა</p>
        </div>
      </div>

      <PhrasesTable
        phrases={phrases}
        totalPages={totalPages}
        currentPage={currentPage}
        categories={allCategories}
        filters={{ level, category, search }}
      />
    </div>
  )
}
