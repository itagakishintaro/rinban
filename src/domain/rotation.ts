import type { Group, Member, Rotation, RotationType } from '../types'
import { addDays, daysBetween, weekdayOf } from './dates'

const WEEKDAYS_JA = ['日', '月', '火', '水', '木', '金', '土']

function ymd(date: string): [number, number, number] {
  return date.split('-').map(Number) as [number, number, number]
}

function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function nextMonth(year: number, month: number): [number, number] {
  return month === 12 ? [year + 1, 1] : [year, month + 1]
}

function lastDayOfMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate()
}

function isWeekend(date: string): boolean {
  const wd = weekdayOf(date)
  return wd === 0 || wd === 6
}

// anchorDateの「第N」(1〜4)。第5週なら'last'(最終X曜日)として扱う
function nthOfAnchor(anchorDate: string): number | 'last' {
  const nth = Math.ceil(ymd(anchorDate)[2] / 7)
  return nth === 5 ? 'last' : nth
}

// year/month の「第N(または最終)X曜日」の日付
function nthWeekdayDate(
  year: number,
  month: number,
  weekday: number,
  nth: number | 'last',
): string {
  if (nth === 'last') {
    const last = lastDayOfMonth(year, month)
    const lastWd = weekdayOf(toDateStr(year, month, last))
    return toDateStr(year, month, last - ((lastWd - weekday + 7) % 7))
  }
  const firstWd = weekdayOf(toDateStr(year, month, 1))
  return toDateStr(year, month, 1 + ((weekday - firstWd + 7) % 7) + (nth - 1) * 7)
}

// 平日ローテーションの基準日: anchorDate以降で最初の平日
function weekdaysBase(anchorDate: string): string {
  let d = anchorDate
  while (isWeekend(d)) d = addDays(d, 1)
  return d
}

// yearlyのyear年の開催日(2/29は平年2/28に丸める)
function yearlyDate(anchorDate: string, year: number): string {
  const [, month, day] = ymd(anchorDate)
  return toDateStr(year, month, Math.min(day, lastDayOfMonth(year, month)))
}

// from以降の開催日をn件返す
export function occurrences(rotation: Rotation, from: string, n: number): string[] {
  const { type, anchorDate } = rotation
  const result: string[] = []

  if (type === 'daily') {
    const start = from > anchorDate ? from : anchorDate
    return Array.from({ length: n }, (_, i) => addDays(start, i))
  }

  if (type === 'weekly') {
    const diff = daysBetween(anchorDate, from)
    const k0 = diff <= 0 ? 0 : Math.ceil(diff / 7)
    return Array.from({ length: n }, (_, i) => addDays(anchorDate, (k0 + i) * 7))
  }

  if (type === 'weekdays') {
    let d = weekdaysBase(anchorDate)
    if (from > d) d = from
    while (result.length < n) {
      if (!isWeekend(d)) result.push(d)
      d = addDays(d, 1)
    }
    return result
  }

  if (type === 'monthlyNthWeekday') {
    const weekday = weekdayOf(anchorDate)
    const nth = nthOfAnchor(anchorDate)
    let [year, month] = ymd(anchorDate)
    while (result.length < n) {
      const date = nthWeekdayDate(year, month, weekday, nth)
      if (date >= anchorDate && date >= from) result.push(date)
      ;[year, month] = nextMonth(year, month)
    }
    return result
  }

  // yearly
  let [year] = ymd(anchorDate)
  while (result.length < n) {
    const date = yearlyDate(anchorDate, year)
    if (date >= anchorDate && date >= from) result.push(date)
    year += 1
  }
  return result
}

// 開催日dateが最初の開催から数えて何回目か(0始まり)
export function occurrenceIndex(rotation: Rotation, date: string): number {
  const { type, anchorDate } = rotation

  if (type === 'daily') return daysBetween(anchorDate, date)
  if (type === 'weekly') return daysBetween(anchorDate, date) / 7

  if (type === 'weekdays') {
    const base = weekdaysBase(anchorDate)
    const diff = daysBetween(base, date)
    const fullWeeks = Math.floor(diff / 7)
    let index = fullWeeks * 5
    for (let i = fullWeeks * 7 + 1; i <= diff; i++) {
      if (!isWeekend(addDays(base, i))) index += 1
    }
    return index
  }

  if (type === 'monthlyNthWeekday') {
    const [ay, am] = ymd(anchorDate)
    const [y, m] = ymd(date)
    return (y - ay) * 12 + (m - am)
  }

  // yearly
  return ymd(date)[0] - ymd(anchorDate)[0]
}

// 設定UI・表示用のラベルを開始日から導出する(Google Calendar方式)
export function rotationLabel(type: RotationType, anchorDate: string): string {
  const weekdayJa = WEEKDAYS_JA[weekdayOf(anchorDate)]
  switch (type) {
    case 'daily':
      return '毎日'
    case 'weekly':
      return `毎週 ${weekdayJa}曜日`
    case 'weekdays':
      return '毎週平日(月〜金)'
    case 'monthlyNthWeekday': {
      const nth = nthOfAnchor(anchorDate)
      return nth === 'last' ? `毎月 最終${weekdayJa}曜日` : `毎月 第${nth}${weekdayJa}曜日`
    }
    case 'yearly': {
      const [, month, day] = ymd(anchorDate)
      return `毎年 ${month}月${day}日`
    }
  }
}

// 開催日dateの担当者。override優先、無効IDは無視。計算不能ならnull
export function assigneeFor(group: Group, date: string): Member | null {
  const { rotation, members, order, overrides } = group
  if (!rotation || order.length === 0) return null
  const overrideId = overrides[date]
  if (overrideId) {
    const member = members.find((m) => m.id === overrideId)
    if (member) return member
  }
  const k = occurrenceIndex(rotation, date)
  const id = order[((k % order.length) + order.length) % order.length]
  return members.find((m) => m.id === id) ?? null
}

// from以降n回分の開催日と担当者(終了日より後は含まない)
export function schedule(
  group: Group,
  from: string,
  n: number,
): { date: string; member: Member | null }[] {
  if (!group.rotation) return []
  return occurrences(group.rotation, from, n)
    .filter((date) => !group.endDate || date <= group.endDate)
    .map((date) => ({
      date,
      member: assigneeFor(group, date),
    }))
}

// 終了日を過ぎているか
export function isEnded(group: Group, today: string): boolean {
  return group.endDate !== undefined && today > group.endDate
}
