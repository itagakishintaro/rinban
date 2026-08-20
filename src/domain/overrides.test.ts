import { test, expect } from 'vitest'
import { swapAssignees, removeOverride } from './overrides'
import type { Group, Rotation } from '../types'

const daily: Rotation = { type: 'daily', anchorDate: '2026-08-22' }
const alice = { id: 'a', name: 'アリス' }
const bob = { id: 'b', name: 'ボブ' }
const group: Group = {
  name: '朝会司会',
  members: [alice, bob],
  order: ['a', 'b'],
  rotation: daily,
  overrides: {},
}
// 担当: 08-22=アリス, 08-23=ボブ, 08-24=アリス, ...

test('swapAssignees: 2つの日付の担当を交換したoverridesを返す', () => {
  expect(swapAssignees(group, '2026-08-22', '2026-08-23')).toEqual({
    '2026-08-22': 'b',
    '2026-08-23': 'a',
  })
})

test('swapAssignees: 既存のoverridesを保持する', () => {
  const g = { ...group, overrides: { '2026-09-01': 'a' } }
  expect(swapAssignees(g, '2026-08-22', '2026-08-23')).toEqual({
    '2026-09-01': 'a',
    '2026-08-22': 'b',
    '2026-08-23': 'a',
  })
})

test('swapAssignees: 入れ替え済みの回をさらに入れ替えると現在の担当基準で交換される', () => {
  // 08-22はすでにボブに入れ替え済み → 08-24(アリス)と交換すると 08-22=アリス, 08-24=ボブ
  const g = { ...group, overrides: { '2026-08-22': 'b', '2026-08-23': 'a' } }
  expect(swapAssignees(g, '2026-08-22', '2026-08-24')).toEqual({
    '2026-08-23': 'a',
    '2026-08-22': 'a',
    '2026-08-24': 'b',
  })
})

test('swapAssignees: 担当が計算できない場合はnull', () => {
  expect(swapAssignees({ ...group, order: [] }, '2026-08-22', '2026-08-23')).toBeNull()
})

test('removeOverride: 指定日のエントリだけ削除する', () => {
  const overrides = { '2026-08-22': 'b', '2026-08-23': 'a' }
  expect(removeOverride(overrides, '2026-08-22')).toEqual({ '2026-08-23': 'a' })
})
