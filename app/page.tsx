import Link from 'next/link'
import Button from '@/components/ui/Button'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-blue-600">WordFlow</h1>
        <div className="flex gap-4">
          <Link href="/login">
            <Button variant="ghost">შესვლა</Button>
          </Link>
          <Link href="/register">
            <Button>რეგისტრაცია</Button>
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            ისწავლე ინგლისური
            <span className="text-blue-600"> მარტივად</span>
          </h2>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            WordFlow - ინგლისური ენის სასწავლო პლატფორმა ქართველებისთვის.
            ინტერაქტიული გაკვეთილები, თამაშები და პროგრესის თრექინგი.
          </p>

          <div className="flex gap-4 justify-center mb-16">
            <Link href="/register">
              <Button size="lg">დაიწყე უფასოდ</Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">შესვლა</Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-20">
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <span className="text-3xl">📚</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">897 ფრაზა</h3>
              <p className="text-gray-600">
                A1-დან C2-მდე დონის ფრაზები კატეგორიებად დაყოფილი
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <span className="text-3xl">🎮</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">6 სასწავლო რეჟიმი</h3>
              <p className="text-gray-600">
                Flashcards, Quiz, Fill-blank, Ordering, Matching, Typing
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <span className="text-3xl">🏆</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">გეიმიფიკაცია</h3>
              <p className="text-gray-600">
                XP, Streak, Badges და Leaderboard მოტივაციისთვის
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="text-center py-8 text-gray-500">
        <p>&copy; 2026 WordFlow. ყველა უფლება დაცულია.</p>
      </footer>
    </div>
  )
}
