import { test, expect } from 'vitest'
import { occurrences, occurrenceIndex, assigneeFor, schedule } from './rotation'
import type { Group, Rotation } from '../types'

// 2026-08-20は木曜日
const weekly: Rotation = { type: 'weekly', weekday: 1, anchorDate: '2026-08-20' } // 毎週月曜
const biweekly: Rotation = { type: 'biweekly', weekday: 1, anchorDate: '2026-08-20' }
const monthly31: Rotation = { type: 'monthly', dayOfMonth: 31, anchorDate: '2026-08-20' }

test('weekly: anchorDate以降の最初の該当曜日から7日ごと', () => {
  expect(occurrences(weekly, '2026-08-20', 3)).toEqual(['2026-08-24', '2026-08-31', '2026-09-07'])
})

test('weekly: anchorDate当日が該当曜日なら当日から', () => {
  const rot: Rotation = { type: 'weekly', weekday: 4, anchorDate: '2026-08-20' } // 木曜開始
  expect(occurrences(rot, '2026-08-20', 2)).toEqual(['2026-08-20', '2026-08-27'])
})

test('weekly: fromが未来なら途中の回から返す', () => {
  expect(occurrences(weekly, '2026-09-01', 2)).toEqual(['2026-09-07', '2026-09-14'])
})

test('weekly: fromが開催日当日ならその日を含む', () => {
  expect(occurrences(weekly, '2026-08-31', 2)).toEqual(['2026-08-31', '2026-09-07'])
})

test('biweekly: 14日ごと', () => {
  expect(occurrences(biweekly, '2026-08-20', 3)).toEqual(['2026-08-24', '2026-09-07', '2026-09-21'])
})

test('monthly: 毎月の該当日。存在しない月は月末に丸める', () => {
  expect(occurrences(monthly31, '2026-08-20', 4)).toEqual([
    '2026-08-31',
    '2026-09-30', // 9月は30日まで
    '2026-10-31',
    '2026-11-30',
  ])
})

test('monthly: 2月は28日(平年)に丸める', () => {
  expect(occurrences(monthly31, '2027-02-01', 1)).toEqual(['2027-02-28'])
})

test('monthly: anchorより前の該当日はその月をスキップ', () => {
  const rot: Rotation = { type: 'monthly', dayOfMonth: 1, anchorDate: '2026-08-20' }
  expect(occurrences(rot, '2026-08-20', 2)).toEqual(['2026-09-01', '2026-10-01'])
})

test('occurrenceIndex: weeklyは基準回からの週数', () => {
  expect(occurrenceIndex(weekly, '2026-08-24')).toBe(0)
  expect(occurrenceIndex(weekly, '2026-09-07')).toBe(2)
})

test('occurrenceIndex: biweeklyは14日単位', () => {
  expect(occurrenceIndex(biweekly, '2026-09-21')).toBe(2)
})

test('occurrenceIndex: monthlyは月数(丸めがあっても正しい)', () => {
  expect(occurrenceIndex(monthly31, '2026-08-31')).toBe(0)
  expect(occurrenceIndex(monthly31, '2026-09-30')).toBe(1)
  expect(occurrenceIndex(monthly31, '2027-01-31')).toBe(5)
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
  expect(assigneeFor(group, '2026-08-24')).toEqual(alice) // k=0
  expect(assigneeFor(group, '2026-08-31')).toEqual(bob) // k=1
  expect(assigneeFor(group, '2026-09-07')).toEqual(alice) // k=2
})

test('assigneeFor: overrideが優先される', () => {
  const g = { ...group, overrides: { '2026-08-24': 'b' } }
  expect(assigneeFor(g, '2026-08-24')).toEqual(bob)
})

test('assigneeFor: 無効なIDのoverrideは無視して通常計算', () => {
  const g = { ...group, overrides: { '2026-08-24': 'deleted-id' } }
  expect(assigneeFor(g, '2026-08-24')).toEqual(alice)
})

test('assigneeFor: rotation未設定やorder空ならnull', () => {
  expect(assigneeFor({ ...group, rotation: undefined }, '2026-08-24')).toBeNull()
  expect(assigneeFor({ ...group, order: [] }, '2026-08-24')).toBeNull()
})

test('schedule: 開催日と担当者の一覧を返す', () => {
  expect(schedule(group, '2026-08-20', 3)).toEqual([
    { date: '2026-08-24', member: alice },
    { date: '2026-08-31', member: bob },
    { date: '2026-09-07', member: alice },
  ])
})
