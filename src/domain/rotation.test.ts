import { test, expect } from 'vitest'
import { occurrences, occurrenceIndex, assigneeFor, schedule, rotationLabel } from './rotation'
import type { CustomRotation, Group, Rotation } from '../types'

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
  const at = (type: Rotation['type']) => rotationLabel({ type, anchorDate: '2026-08-22' } as Rotation)
  expect(at('daily')).toBe('毎日')
  expect(at('weekly')).toBe('毎週 土曜日')
  expect(at('monthlyNthWeekday')).toBe('毎月 第4土曜日')
  expect(rotationLabel({ type: 'monthlyNthWeekday', anchorDate: '2026-08-29' })).toBe('毎月 最終土曜日')
  expect(at('yearly')).toBe('毎年 8月22日')
  expect(at('weekdays')).toBe('毎週平日(月〜金)')
})

test('rotationLabel: カスタムは設定内容を要約する', () => {
  expect(rotationLabel(custom({ interval: 3 }))).toBe('3日ごと')
  expect(rotationLabel(custom({ interval: 2, unit: 'week', weekdays: [1, 5] }))).toBe(
    '2週間ごと(月・金)',
  )
  expect(rotationLabel(custom({ interval: 1, unit: 'month', monthlyMode: 'day' }))).toBe(
    '1か月ごと(22日)',
  )
  expect(rotationLabel(custom({ interval: 2, unit: 'month', monthlyMode: 'nthWeekday' }))).toBe(
    '2か月ごと(第4土曜日)',
  )
  expect(rotationLabel(custom({ interval: 2, unit: 'year' }))).toBe('2年ごと(8月22日)')
  expect(rotationLabel(custom({ interval: 1, ends: { type: 'count', count: 5 } }))).toBe(
    '1日ごと、5回',
  )
  expect(rotationLabel(custom({ interval: 1, ends: { type: 'until', date: '2026-11-20' } }))).toBe(
    '1日ごと、11月20日まで',
  )
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

test('schedule: 終了日より後の開催は含まれない', () => {
  const g = { ...group, endDate: '2026-08-29' }
  expect(schedule(g, '2026-08-22', 10)).toEqual([
    { date: '2026-08-22', member: alice },
    { date: '2026-08-29', member: bob },
  ])
})

// ---- カスタムの繰り返し ----

function custom(over: Partial<CustomRotation>): CustomRotation {
  return { type: 'custom', anchorDate: '2026-08-22', interval: 1, unit: 'day', ...over }
}

test('custom day: N日ごと', () => {
  expect(occurrences(custom({ interval: 3 }), '2026-08-22', 3)).toEqual([
    '2026-08-22',
    '2026-08-25',
    '2026-08-28',
  ])
  expect(occurrenceIndex(custom({ interval: 3 }), '2026-08-28')).toBe(2)
})

test('custom week: N週間ごとに複数曜日(週内は月→日の順)', () => {
  // 2026-08-22(土)開始、2週間ごとの月・金。第0週の月(8/17)金(8/21)は開始日前でスキップ
  const rot = custom({ interval: 2, unit: 'week', weekdays: [1, 5] })
  expect(occurrences(rot, '2026-08-22', 4)).toEqual([
    '2026-08-31', // 第2週の月
    '2026-09-04', // 第2週の金
    '2026-09-14',
    '2026-09-18',
  ])
  expect(occurrenceIndex(rot, '2026-08-31')).toBe(0)
  expect(occurrenceIndex(rot, '2026-09-18')).toBe(3)
})

test('custom week: 開始日当日を含む', () => {
  const rot = custom({ interval: 1, unit: 'week', weekdays: [1, 6] }) // 月・土
  expect(occurrences(rot, '2026-08-22', 3)).toEqual([
    '2026-08-22', // 開始日(土)
    '2026-08-24', // 翌週の月
    '2026-08-29',
  ])
})

test('custom month: Nか月ごとのN日(月末丸め)', () => {
  const rot = custom({ anchorDate: '2026-08-31', interval: 2, unit: 'month', monthlyMode: 'day' })
  expect(occurrences(rot, '2026-08-31', 3)).toEqual(['2026-08-31', '2026-10-31', '2026-12-31'])
  const clamp = custom({ anchorDate: '2026-08-31', interval: 1, unit: 'month', monthlyMode: 'day' })
  expect(occurrences(clamp, '2026-09-01', 1)).toEqual(['2026-09-30'])
})

test('custom month: Nか月ごとの第N曜日', () => {
  // 2026-08-22は第4土曜
  const rot = custom({ interval: 2, unit: 'month', monthlyMode: 'nthWeekday' })
  expect(occurrences(rot, '2026-08-22', 3)).toEqual(['2026-08-22', '2026-10-24', '2026-12-26'])
  expect(occurrenceIndex(rot, '2026-12-26')).toBe(2)
})

test('custom year: N年ごと', () => {
  const rot = custom({ interval: 2, unit: 'year' })
  expect(occurrences(rot, '2026-08-22', 3)).toEqual(['2026-08-22', '2028-08-22', '2030-08-22'])
  expect(occurrenceIndex(rot, '2030-08-22')).toBe(2)
})

test('custom ends until: 終了日より後は開催しない', () => {
  const rot = custom({ interval: 1, ends: { type: 'until', date: '2026-08-24' } })
  expect(occurrences(rot, '2026-08-22', 10)).toEqual(['2026-08-22', '2026-08-23', '2026-08-24'])
})

test('custom ends count: 通算N回で終了(fromが途中でも通算で数える)', () => {
  const rot = custom({ interval: 1, ends: { type: 'count', count: 5 } })
  expect(occurrences(rot, '2026-08-22', 10)).toHaveLength(5)
  expect(occurrences(rot, '2026-08-25', 10)).toEqual(['2026-08-25', '2026-08-26']) // 4回目と5回目
})

test('custom: 担当は通算回数で循環する', () => {
  const g: Group = { ...group, rotation: custom({ interval: 1, unit: 'week', weekdays: [1, 5] }) }
  // 開催: 8/24(月)k=0, 8/28(金)k=1, 8/31(月)k=2...
  expect(assigneeFor(g, '2026-08-24')).toEqual(alice)
  expect(assigneeFor(g, '2026-08-28')).toEqual(bob)
  expect(assigneeFor(g, '2026-08-31')).toEqual(alice)
})
