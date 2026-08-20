import { test, expect } from 'vitest'
import { addDays, daysBetween, formatJa, todayInTokyo } from './dates'

test('addDays: 月をまたぐ加算', () => {
  expect(addDays('2026-08-30', 3)).toBe('2026-09-02')
})

test('daysBetween: 日数差(to - from)', () => {
  expect(daysBetween('2026-08-20', '2026-08-27')).toBe(7)
  expect(daysBetween('2026-08-27', '2026-08-20')).toBe(-7)
})

test('formatJa: M月D日(曜)形式', () => {
  expect(formatJa('2026-08-20')).toBe('8月20日(木)')
  expect(formatJa('2026-01-05')).toBe('1月5日(月)')
})

test('todayInTokyo: 日本時間の日付を返す', () => {
  // UTC 2026-08-20 20:00 は日本時間では翌日
  expect(todayInTokyo(new Date('2026-08-20T20:00:00Z'))).toBe('2026-08-21')
  expect(todayInTokyo(new Date('2026-08-20T10:00:00Z'))).toBe('2026-08-20')
})
