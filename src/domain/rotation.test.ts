import { test, expect } from 'vitest'
import { occurrences, occurrenceIndex, assigneeFor, schedule, rotationLabel } from './rotation'
import type { Group, Rotation } from '../types'

// 2026-08-22は土曜日(8月の土曜: 1, 8, 15, 22, 29 → 22日は第4)
const daily: Rotation = { type: 'daily', anchorDate: '2026-08-22' }
const weekly: Rotation = { type: 'weekly', anchorDate: '2026-08-22' }
const weekdays: Rotation = { type: 'weekdays', anchorDate: '2026-08-22' }
const nth4: Rotation = { type: 'monthlyNthWeekday', anchorDate: '2026-08-22' }
const nth5: Rotation = { type: 'monthlyNthWeekday', anchorDate: '2026-08-29' } // 第5土曜=最終扱い
const yearly: Rotation = { type: 'yearly', anchorDate: '2026-08-22' }

test('daily: anchorDateから毎日', () => {
  expect(occurrences(daily, '2026-08-22', 3)).toEqual(['2026-08-22', '2026-08-23', '2026-08-24'])
})

test('daily: fromがanchorより未来ならfromから', () => {
  expect(occurrences(daily, '2026-09-01', 2)).toEqual(['2026-09-01', '2026-09-02'])
})

test('daily: fromがanchorより過去ならanchorから', () => {
  expect(occurrences(daily, '2026-08-01', 2)).toEqual(['2026-08-22', '2026-08-23'])
})

test('weekly: anchorDateと同じ曜日に7日ごと', () => {
  expect(occurrences(weekly, '2026-08-22', 3)).toEqual(['2026-08-22', '2026-08-29', '2026-09-05'])
})

test('weekly: fromが途中なら次の回から', () => {
  expect(occurrences(weekly, '2026-08-23', 2)).toEqual(['2026-08-29', '2026-09-05'])
})

test('weekdays: 平日のみ。anchorが土曜なら翌月曜から', () => {
  expect(occurrences(weekdays, '2026-08-22', 6)).toEqual([
    '2026-08-24', // 月
    '2026-08-25',
    '2026-08-26',
    '2026-08-27',
    '2026-08-28', // 金
    '2026-08-31', // 翌月曜(土日スキップ)
  ])
})

test('monthlyNthWeekday: 毎月第4土曜日', () => {
  expect(occurrences(nth4, '2026-08-22', 3)).toEqual([
    '2026-08-22', // 8月第4土曜
    '2026-09-26', // 9月第4土曜
    '2026-10-24', // 10月第4土曜(10月は31日が第5土曜)
  ])
})

test('monthlyNthWeekday: 第5週開始は最終X曜日として扱う', () => {
  expect(occurrences(nth5, '2026-08-29', 3)).toEqual([
    '2026-08-29', // 8月最終土曜
    '2026-09-26', // 9月最終土曜(第4)
    '2026-10-31', // 10月最終土曜(第5)
  ])
})

test('yearly: 毎年同じ月日', () => {
  expect(occurrences(yearly, '2026-08-22', 2)).toEqual(['2026-08-22', '2027-08-22'])
})

test('yearly: 2/29開始は平年2/28に丸める', () => {
  const rot: Rotation = { type: 'yearly', anchorDate: '2028-02-29' }
  expect(occurrences(rot, '2028-02-29', 2)).toEqual(['2028-02-29', '2029-02-28'])
})

test('occurrenceIndex: dailyは日数', () => {
  expect(occurrenceIndex(daily, '2026-08-22')).toBe(0)
  expect(occurrenceIndex(daily, '2026-08-25')).toBe(3)
})

test('occurrenceIndex: weeklyは週数', () => {
  expect(occurrenceIndex(weekly, '2026-09-05')).toBe(2)
})

test('occurrenceIndex: weekdaysは営業日数(週をまたいでも連続)', () => {
  expect(occurrenceIndex(weekdays, '2026-08-24')).toBe(0)
  expect(occurrenceIndex(weekdays, '2026-08-28')).toBe(4) // 同じ週の金曜
  expect(occurrenceIndex(weekdays, '2026-08-31')).toBe(5) // 翌月曜
})

test('occurrenceIndex: monthlyNthWeekdayは月数', () => {
  expect(occurrenceIndex(nth4, '2026-10-24')).toBe(2)
  expect(occurrenceIndex(nth5, '2026-10-31')).toBe(2)
})

test('occurrenceIndex: yearlyは年数', () => {
  expect(occurrenceIndex(yearly, '2027-08-22')).toBe(1)
})

test('rotationLabel: 開始日からラベルを導出する', () => {
  expect(rotationLabel('daily', '2026-08-22')).toBe('毎日')
  expect(rotationLabel('weekly', '2026-08-22')).toBe('毎週 土曜日')
  expect(rotationLabel('monthlyNthWeekday', '2026-08-22')).toBe('毎月 第4土曜日')
  expect(rotationLabel('monthlyNthWeekday', '2026-08-29')).toBe('毎月 最終土曜日')
  expect(rotationLabel('yearly', '2026-08-22')).toBe('毎年 8月22日')
  expect(rotationLabel('weekdays', '2026-08-22')).toBe('毎週平日(月〜金)')
})

const alice = { id: 'a', name: 'アリス' }
const bob = { id: 'b', name: 'ボブ' }
const group: Group = {
  name: '朝会司会',
  members: [alice, bob],
  order: ['a', 'b'],
  rotation: weekly,
  overrides: {},
}

test('assigneeFor: order順に循環する', () => {
  expect(assigneeFor(group, '2026-08-22')).toEqual(alice) // k=0
  expect(assigneeFor(group, '2026-08-29')).toEqual(bob) // k=1
  expect(assigneeFor(group, '2026-09-05')).toEqual(alice) // k=2
})

test('assigneeFor: overrideが優先される', () => {
  const g = { ...group, overrides: { '2026-08-22': 'b' } }
  expect(assigneeFor(g, '2026-08-22')).toEqual(bob)
})

test('assigneeFor: 無効なIDのoverrideは無視して通常計算', () => {
  const g = { ...group, overrides: { '2026-08-22': 'deleted-id' } }
  expect(assigneeFor(g, '2026-08-22')).toEqual(alice)
})

test('assigneeFor: rotation未設定やorder空ならnull', () => {
  expect(assigneeFor({ ...group, rotation: undefined }, '2026-08-22')).toBeNull()
  expect(assigneeFor({ ...group, order: [] }, '2026-08-22')).toBeNull()
})

test('schedule: 開催日と担当者の一覧を返す', () => {
  expect(schedule(group, '2026-08-22', 3)).toEqual([
    { date: '2026-08-22', member: alice },
    { date: '2026-08-29', member: bob },
    { date: '2026-09-05', member: alice },
  ])
})
