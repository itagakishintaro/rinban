import type { Group, Member, Rotation } from '../types'
import { addDays, daysBetween, weekdayOf } from './dates'

// 週次・隔週の基準日: anchorDate以降で最初の該当曜日
function weeklyBase(rotation: Rotation): string {
  const diff = (rotation.weekday! - weekdayOf(rotation.anchorDate) + 7) % 7
  return addDays(rotation.anchorDate, diff)
}

function nextMonth(year: number, month: number): [number, number] {
  return month === 12 ? [year + 1, 1] : [year, month + 1]
}

function lastDayOfMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate()
}

// year/monthの開催日(存在しない日は月末に丸める)
function monthlyDate(year: number, month: number, dayOfMonth: number): string {
  const day = Math.min(dayOfMonth, lastDayOfMonth(year, month))
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

// 最初の開催がある年月
function monthlyFirst(rotation: Rotation): { year: number; month: number } {
  let [year, month] = rotation.anchorDate.split('-').map(Number)
  if (monthlyDate(year, month, rotation.dayOfMonth!) < rotation.anchorDate) {
    ;[year, month] = nextMonth(year, month)
  }
  return { year, month }
}

// from以降の開催日をn件返す
export function occurrences(rotation: Rotation, from: string, n: number): string[] {
  if (rotation.type === 'monthly') {
    let { year, month } = monthlyFirst(rotation)
    const result: string[] = []
    while (result.length < n) {
      const date = monthlyDate(year, month, rotation.dayOfMonth!)
      if (date >= from) result.push(date)
      ;[year, month] = nextMonth(year, month)
    }
    return result
  }
  const step = rotation.type === 'weekly' ? 7 : 14
  const base = weeklyBase(rotation)
  const diff = daysBetween(base, from)
  const k0 = diff <= 0 ? 0 : Math.ceil(diff / step)
  return Array.from({ length: n }, (_, i) => addDays(base, (k0 + i) * step))
}

// 開催日dateが最初の開催から数えて何回目か(0始まり)
export function occurrenceIndex(rotation: Rotation, date: string): number {
  if (rotation.type === 'monthly') {
    const first = monthlyFirst(rotation)
    const [year, month] = date.split('-').map(Number)
    return (year - first.year) * 12 + (month - first.month)
  }
  const step = rotation.type === 'weekly' ? 7 : 14
  return daysBetween(weeklyBase(rotation), date) / step
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

// from以降n回分の開催日と担当者
export function schedule(
  group: Group,
  from: string,
  n: number,
): { date: string; member: Member | null }[] {
  if (!group.rotation) return []
  return occurrences(group.rotation, from, n).map((date) => ({
    date,
    member: assigneeFor(group, date),
  }))
}
