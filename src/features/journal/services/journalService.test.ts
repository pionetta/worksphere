import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '@/lib/db'
import * as journalService from './journalService'

describe('journalService', () => {
  const userId = 'user-journal-test-1'

  beforeEach(async () => {
    await db.journal_entries.clear()
  })

  it('should add a note and retrieve it', async () => {
    const entry = await journalService.addJournalEntry(userId, {
      title: 'Refleksi Pagi',
      content: 'Hari ini fokus selesaikan fitur to-do dan review pull request.',
      type: 'note',
      period: 'daily',
      category: 'work',
    })

    expect(entry.id).toBeDefined()
    expect(entry.title).toBe('Refleksi Pagi')
    expect(entry.type).toBe('note')

    const all = await journalService.getAllJournalEntries(userId)
    expect(all).toHaveLength(1)
    expect(all[0].content).toContain('fitur to-do')
  })

  it('should add an achievement and calculate summary', async () => {
    await journalService.addJournalEntry(userId, {
      title: 'Menyelesaikan Modul Presensi',
      content: 'Berhasil membuat export Excel dan PDF presensi tanpa bug.',
      type: 'achievement',
      period: 'daily',
      icon_tag: 'trophy',
      category: 'work',
    })

    await journalService.addJournalEntry(userId, {
      title: 'Target Tabungan Mingguan Tercapai',
      content: 'Menabung Rp 500.000 untuk dana darurat.',
      type: 'achievement',
      period: 'weekly',
      icon_tag: 'star',
      category: 'finance',
    })

    const summary = await journalService.getJournalSummary(userId)
    expect(summary.totalNotes).toBe(0)
    expect(summary.totalAchievements).toBe(2)
    expect(summary.dailyWins).toBe(1)
    expect(summary.weeklyWins).toBe(1)
  })

  it('should update and delete journal entry', async () => {
    const entry = await journalService.addJournalEntry(userId, {
      title: 'Ide Desain UI',
      content: 'Warna dark mode elegan.',
    })

    await journalService.updateJournalEntry(entry.id, {
      title: 'Ide Desain UI 2.0',
    })

    let all = await journalService.getAllJournalEntries(userId)
    expect(all[0].title).toBe('Ide Desain UI 2.0')

    await journalService.deleteJournalEntry(entry.id)
    all = await journalService.getAllJournalEntries(userId)
    expect(all).toHaveLength(0)
  })
})
