import { db } from '@/lib/db'
import type { JournalEntry, JournalPeriod, JournalType } from '@/types'

export async function getAllJournalEntries(userId: string): Promise<JournalEntry[]> {
  const items = await db.journal_entries.where('user_id').equals(userId).toArray()
  return items.sort((a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime() || new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export async function getJournalEntriesByType(
  userId: string,
  type: JournalType
): Promise<JournalEntry[]> {
  const items = await db.journal_entries
    .where('user_id')
    .equals(userId)
    .and(item => item.type === type)
    .toArray()
  return items.sort((a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime() || new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export async function getJournalEntriesByPeriod(
  userId: string,
  period: JournalPeriod
): Promise<JournalEntry[]> {
  const items = await db.journal_entries
    .where('user_id')
    .equals(userId)
    .and(item => item.period === period)
    .toArray()
  return items.sort((a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime() || new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export async function addJournalEntry(
  userId: string,
  data: {
    title: string
    content: string
    type?: JournalType
    period?: JournalPeriod
    category?: string
    icon_tag?: string
    entry_date?: string
  }
): Promise<JournalEntry> {
  const now = new Date().toISOString()
  const today = now.split('T')[0]

  const entry: JournalEntry = {
    id: crypto.randomUUID(),
    user_id: userId,
    title: data.title.trim(),
    content: data.content.trim(),
    type: data.type ?? 'note',
    period: data.period ?? 'daily',
    category: data.category ?? 'work',
    icon_tag: data.icon_tag ?? (data.type === 'achievement' ? 'trophy' : 'lightbulb'),
    entry_date: data.entry_date ?? today,
    created_at: now,
    updated_at: now,
  }

  await db.journal_entries.add(entry)
  return entry
}

export async function updateJournalEntry(
  id: string,
  data: Partial<
    Pick<
      JournalEntry,
      'title' | 'content' | 'type' | 'period' | 'category' | 'icon_tag' | 'entry_date'
    >
  >
): Promise<void> {
  const now = new Date().toISOString()
  await db.journal_entries.update(id, {
    ...data,
    updated_at: now,
  })
}

export async function deleteJournalEntry(id: string): Promise<void> {
  await db.journal_entries.delete(id)
}

export interface JournalSummary {
  totalNotes: number
  totalAchievements: number
  dailyWins: number
  weeklyWins: number
  monthlyWins: number
}

export async function getJournalSummary(userId: string): Promise<JournalSummary> {
  const items = await getAllJournalEntries(userId)

  let totalNotes = 0
  let totalAchievements = 0
  let dailyWins = 0
  let weeklyWins = 0
  let monthlyWins = 0

  for (const item of items) {
    if (item.type === 'note') {
      totalNotes++
    } else {
      totalAchievements++
      if (item.period === 'daily') dailyWins++
      if (item.period === 'weekly') weeklyWins++
      if (item.period === 'monthly') monthlyWins++
    }
  }

  return {
    totalNotes,
    totalAchievements,
    dailyWins,
    weeklyWins,
    monthlyWins,
  }
}
