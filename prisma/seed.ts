import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'
import 'dotenv/config'

// Prisma 7 uses adapter pattern
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Starting seed...')

  // წაიკითხე english.json
  const phrasesPath = path.join(process.cwd(), 'english.json')
  const phrasesData = JSON.parse(fs.readFileSync(phrasesPath, 'utf-8'))

  // ფრაზების ჩასმა
  const phrases = Object.entries(phrasesData).map(([id, data]: [string, any]) => ({
    id: parseInt(id),
    english: data.english,
    georgian: data.georgian,
    level: data.level,
    category: data.category,
  }))

  console.log(`📝 Inserting ${phrases.length} phrases...`)

  // Batch insert
  for (let i = 0; i < phrases.length; i += 100) {
    const batch = phrases.slice(i, i + 100)
    await prisma.phrase.createMany({
      data: batch,
      skipDuplicates: true,
    })
    console.log(`  ✓ Inserted ${Math.min(i + 100, phrases.length)}/${phrases.length}`)
  }

  // Achievements შექმნა
  console.log('🏆 Creating achievements...')

  const achievements = [
    { name: 'First Step', description: 'პირველი გაკვეთილის დასრულება', icon: '👶', requirement: 1, type: 'phrases' },
    { name: 'Getting Started', description: '10 ფრაზის სწავლა', icon: '📚', requirement: 10, type: 'phrases' },
    { name: 'Committed Learner', description: '50 ფრაზის სწავლა', icon: '🎯', requirement: 50, type: 'phrases' },
    { name: 'Century Club', description: '100 ფრაზის სწავლა', icon: '💯', requirement: 100, type: 'phrases' },
    { name: 'Phrase Master', description: '500 ფრაზის სწავლა', icon: '🏆', requirement: 500, type: 'phrases' },

    { name: 'Week Warrior', description: '7 დღის streak', icon: '🔥', requirement: 7, type: 'streak' },
    { name: 'Two Week Champion', description: '14 დღის streak', icon: '⚡', requirement: 14, type: 'streak' },
    { name: 'Month Master', description: '30 დღის streak', icon: '🌟', requirement: 30, type: 'streak' },
    { name: 'Unstoppable', description: '100 დღის streak', icon: '💎', requirement: 100, type: 'streak' },

    { name: 'XP Starter', description: '100 XP მოგროვება', icon: '⭐', requirement: 100, type: 'xp' },
    { name: 'XP Hunter', description: '500 XP მოგროვება', icon: '🌙', requirement: 500, type: 'xp' },
    { name: 'XP Champion', description: '1000 XP მოგროვება', icon: '☀️', requirement: 1000, type: 'xp' },
    { name: 'XP Legend', description: '5000 XP მოგროვება', icon: '👑', requirement: 5000, type: 'xp' },

    { name: 'A1 Complete', description: 'A1 დონის დასრულება', icon: '🥉', requirement: 1, type: 'level' },
    { name: 'A2 Complete', description: 'A2 დონის დასრულება', icon: '🥈', requirement: 2, type: 'level' },
    { name: 'B1 Complete', description: 'B1 დონის დასრულება', icon: '🥇', requirement: 3, type: 'level' },
    { name: 'B2 Complete', description: 'B2 დონის დასრულება', icon: '🏅', requirement: 4, type: 'level' },
    { name: 'C1 Complete', description: 'C1 დონის დასრულება', icon: '🎖️', requirement: 5, type: 'level' },
    { name: 'C2 Complete', description: 'C2 დონის დასრულება', icon: '🏆', requirement: 6, type: 'level' },

    { name: 'Perfect Round', description: '100% სწორი პასუხები ერთ სესიაში', icon: '✨', requirement: 1, type: 'perfect' },
    { name: 'Perfect Streak', description: '5 სრულყოფილი სესია ზედიზედ', icon: '💫', requirement: 5, type: 'perfect' },
  ]

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { name: achievement.name },
      update: {},
      create: achievement,
    })
  }

  console.log(`  ✓ Created ${achievements.length} achievements`)

  console.log('✅ Seed completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
