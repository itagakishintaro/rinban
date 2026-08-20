// 日付は常に 'YYYY-MM-DD' 文字列で扱う(タイムゾーンはAsia/Tokyo固定)

const WEEKDAYS_JA = ['日', '月', '火', '水', '木', '金', '土']

function toUTC(date: string): Date {
  return new Date(`${date}T00:00:00Z`)
}

function toStr(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export function addDays(date: string, days: number): string {
  const d = toUTC(date)
  d.setUTCDate(d.getUTCDate() + days)
  return toStr(d)
}

export function daysBetween(from: string, to: string): number {
  return (toUTC(to).getTime() - toUTC(from).getTime()) / 86_400_000
}

export function weekdayOf(date: string): number {
  return toUTC(date).getUTCDay()
}

export function formatJa(date: string): string {
  const d = toUTC(date)
  return `${d.getUTCMonth() + 1}月${d.getUTCDate()}日(${WEEKDAYS_JA[d.getUTCDay()]})`
}

export function todayInTokyo(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Tokyo' }).format(now)
}
