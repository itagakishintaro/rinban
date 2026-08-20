import type { CustomRotation, Group, Member, Rotation } from '../types'
import { addDays, daysBetween, weekdayOf } from './dates'

const WEEKDAYS_JA = ['日', '月', '火', '水', '木', '金', '土']
const SAFETY_CAP = 5000 // 無限ループの安全弁

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

// 月曜を週の先頭とした週内位置(月=0〜日=6)
function mondayRank(weekday: number): number {
  return (weekday + 6) % 7
}

function weekStartMonday(date: string): string {
  return addDays(date, -mondayRank(weekdayOf(date)))
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

// year/monthのN日(存在しない月は月末に丸める)
function monthlyDate(year: number, month: number, dayOfMonth: number): string {
  return toDateStr(year, month, Math.min(dayOfMonth, lastDayOfMonth(year, month)))
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

// カスタムの開催日を最初の回から順に列挙する(ends.untilで停止、ends.countは呼び出し側で数える)
function* customDates(rot: CustomRotation): Generator<string> {
  const { anchorDate, interval, unit } = rot

  if (unit === 'day') {
    for (let i = 0; ; i++) yield addDays(anchorDate, i * interval)
  } else if (unit === 'week') {
    const base = weekStartMonday(anchorDate)
    const weekdays = rot.weekdays?.length ? rot.weekdays : [weekdayOf(anchorDate)]
    const ranks = weekdays.map(mondayRank).sort((a, b) => a - b)
    for (let block = 0; ; block++) {
      const weekStart = addDays(base, block * interval * 7)
      for (const rank of ranks) {
        const date = addDays(weekStart, rank)
        if (date >= anchorDate) yield date
      }
    }
  } else if (unit === 'month') {
    let [year, month] = ymd(anchorDate)
    const weekday = weekdayOf(anchorDate)
    const nth = nthOfAnchor(anchorDate)
    const day = ymd(anchorDate)[2]
    for (;;) {
      yield rot.monthlyMode === 'nthWeekday'
        ? nthWeekdayDate(year, month, weekday, nth)
        : monthlyDate(year, month, day)
      for (let i = 0; i < interval; i++) [year, month] = nextMonth(year, month)
    }
  } else {
    // year
    let [year] = ymd(anchorDate)
    for (;;) {
      yield yearlyDate(anchorDate, year)
      year += interval
    }
  }
}

function customOccurrences(rot: CustomRotation, from: string, n: number): string[] {
  const result: string[] = []
  let index = 0
  for (const date of customDates(rot)) {
    if (rot.ends?.type === 'count' && index >= rot.ends.count) break
    if (rot.ends?.type === 'until' && date > rot.ends.date) break
    if (date >= from) result.push(date)
    index++
    if (result.length >= n || index > SAFETY_CAP) break
  }
  return result
}

function customIndex(rot: CustomRotation, date: string): number {
  let index = 0
  for (const d of customDates(rot)) {
    if (d >= date || index > SAFETY_CAP) return index
    index++
  }
  return index
}

// from以降の開催日をn件返す
export function occurrences(rotation: Rotation, from: string, n: number): string[] {
  const { type, anchorDate } = rotation

  if (type === 'custom') return customOccurrences(rotation, from, n)

  if (type === 'daily') {
    const start = from > anchorDate ? from : anchorDate
    return Array.from({ length: n }, (_, i) => addDays(start, i))
  }

  if (type === 'weekly') {
    const diff = daysBetween(anchorDate, from)
    const k0 = diff <= 0 ? 0 : Math.ceil(diff / 7)
    return Array.from({ length: n }, (_, i) => addDays(anchorDate, (k0 + i) * 7))
  }

  const result: string[] = []

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

  if (type === 'custom') return customIndex(rotation, date)
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

// 設定UI・表示用のラベル(Google Calendar方式: 開始日・設定内容から導出)
export function rotationLabel(rotation: Rotation): string {
  const { type, anchorDate } = rotation
  const weekdayJa = WEEKDAYS_JA[weekdayOf(anchorDate)]
  const [, month, day] = ymd(anchorDate)

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
    case 'yearly':
      return `毎年 ${month}月${day}日`
    case 'custom': {
      const { interval, unit } = rotation
      let core: string
      if (unit === 'day') {
        core = `${interval}日ごと`
      } else if (unit === 'week') {
        const weekdays = rotation.weekdays?.length ? rotation.weekdays : [weekdayOf(anchorDate)]
        const names = [...weekdays]
          .sort((a, b) => mondayRank(a) - mondayRank(b))
          .map((wd) => WEEKDAYS_JA[wd])
          .join('・')
        core = `${interval}週間ごと(${names})`
      } else if (unit === 'month') {
        const nth = nthOfAnchor(anchorDate)
        const what =
          rotation.monthlyMode === 'nthWeekday'
            ? nth === 'last'
              ? `最終${weekdayJa}曜日`
              : `第${nth}${weekdayJa}曜日`
            : `${day}日`
        core = `${interval}か月ごと(${what})`
      } else {
        core = `${interval}年ごと(${month}月${day}日)`
      }
      const ends = rotation.ends
      if (ends?.type === 'count') return `${core}、${ends.count}回`
      if (ends?.type === 'until') {
        const [, em, ed] = ymd(ends.date)
        return `${core}、${em}月${ed}日まで`
      }
      return core
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

// from以降n回分の開催日と担当者(グループの終了日より後は含まない)
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
