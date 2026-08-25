/**
 * Utility for calculating automated savings and debt repayment targets (Daily, Weekly, Monthly)
 */

export interface TargetBreakdown {
  days: number
  weeks: number
  months: number
  perDay: number
  perWeek: number
  perMonth: number
  isExpired: boolean
  label: string
}

/**
 * Calculates required periodic target amounts (daily, weekly, monthly)
 * given a total target amount and a deadline (Date string YYYY-MM-DD or number of months).
 */
export function calculateTargetBreakdown(
  targetAmount: number,
  deadlineOrMonths: string | number | null | undefined,
  baseDate: Date = new Date()
): TargetBreakdown | null {
  if (!targetAmount || targetAmount <= 0 || !deadlineOrMonths) {
    return null
  }

  if (typeof deadlineOrMonths === 'number') {
    if (deadlineOrMonths <= 0) return null
    const months = deadlineOrMonths
    const days = Math.max(1, Math.round(months * 30.4375))
    const weeks = Math.max(1, Math.round((days / 7) * 10) / 10)

    const perMonth = Math.ceil(targetAmount / months)
    const perWeek = Math.ceil(targetAmount / (days / 7))
    const perDay = Math.ceil(targetAmount / days)

    return {
      days,
      weeks,
      months,
      perDay,
      perWeek,
      perMonth,
      isExpired: false,
      label: `${months} bulan (${days} hari)`,
    }
  }

  const target = new Date(deadlineOrMonths)
  if (isNaN(target.getTime())) return null

  const today = new Date(baseDate)
  today.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)

  const diffTime = target.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays <= 0) {
    return {
      days: 1,
      weeks: 1,
      months: 1,
      perDay: targetAmount,
      perWeek: targetAmount,
      perMonth: targetAmount,
      isExpired: true,
      label: 'Lewat tenggat waktu',
    }
  }

  const days = diffDays
  const weeks = Math.max(1, Math.round((days / 7) * 10) / 10)
  const months = Math.max(1, Math.round((days / 30.4375) * 10) / 10)

  const perDay = Math.ceil(targetAmount / days)
  const perWeek = Math.ceil(targetAmount / Math.max(1, days / 7))
  const perMonth = Math.ceil(targetAmount / Math.max(1, days / 30.4375))

  return {
    days,
    weeks,
    months,
    perDay,
    perWeek,
    perMonth,
    isExpired: false,
    label: `${days} hari (~${months} bln)`,
  }
}
