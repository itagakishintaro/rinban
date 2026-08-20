import { test, expect } from 'vitest'
import { upsertRecent, RECENT_MAX } from './recentGroups'

const list = [
  { id: 'a', name: '朝会司会', visitedAt: 100 },
  { id: 'b', name: '読書会', visitedAt: 50 },
]

test('新しい訪問は先頭に追加される', () => {
  expect(upsertRecent(list, { id: 'c', name: '掃除当番' }, 200)).toEqual([
    { id: 'c', name: '掃除当番', visitedAt: 200 },
    ...list,
  ])
})

test('再訪問は先頭へ移動し名前と訪問日時を更新する', () => {
  expect(upsertRecent(list, { id: 'b', name: '読書会(改名)' }, 200)).toEqual([
    { id: 'b', name: '読書会(改名)', visitedAt: 200 },
    { id: 'a', name: '朝会司会', visitedAt: 100 },
  ])
})

test('最大件数を超えたら古いものから削除される', () => {
  const full = Array.from({ length: RECENT_MAX }, (_, i) => ({
    id: `g${i}`,
    name: `輪番${i}`,
    visitedAt: RECENT_MAX - i,
  }))
  const result = upsertRecent(full, { id: 'new', name: '新規' }, 999)
  expect(result).toHaveLength(RECENT_MAX)
  expect(result[0].id).toBe('new')
  expect(result.at(-1)!.id).toBe(`g${RECENT_MAX - 2}`)
})
