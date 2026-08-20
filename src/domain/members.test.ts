import { test, expect } from 'vitest'
import { addMember, renameMember, removeMember, membersInOrder, moveInOrder } from './members'

const alice = { id: 'a', name: 'アリス' }
const bob = { id: 'b', name: 'ボブ' }
const group = { members: [alice, bob], order: ['a', 'b'] }

test('addMember: membersとorderの末尾に追加される', () => {
  const carol = { id: 'c', name: 'キャロル' }
  expect(addMember(group, carol)).toEqual({
    members: [alice, bob, carol],
    order: ['a', 'b', 'c'],
  })
})

test('renameMember: 対象だけ名前が変わる', () => {
  expect(renameMember(group.members, 'a', 'アリシア')).toEqual([
    { id: 'a', name: 'アリシア' },
    bob,
  ])
})

test('renameMember: 存在しないIDなら変化しない', () => {
  expect(renameMember(group.members, 'x', '誰か')).toEqual(group.members)
})

test('removeMember: membersとorderの両方から除かれる', () => {
  expect(removeMember(group, 'a')).toEqual({ members: [bob], order: ['b'] })
})

test('removeMember: 存在しないIDなら変化しない', () => {
  expect(removeMember(group, 'x')).toEqual(group)
})

test('membersInOrder: order順に並ぶ', () => {
  expect(membersInOrder({ members: [alice, bob], order: ['b', 'a'] })).toEqual([bob, alice])
})

test('membersInOrder: orderにない無効IDは無視される', () => {
  expect(membersInOrder({ members: [alice], order: ['x', 'a'] })).toEqual([alice])
})

test('moveInOrder: 上に移動すると前の要素と入れ替わる', () => {
  expect(moveInOrder(['a', 'b', 'c'], 'b', -1)).toEqual(['b', 'a', 'c'])
})

test('moveInOrder: 下に移動すると次の要素と入れ替わる', () => {
  expect(moveInOrder(['a', 'b', 'c'], 'b', 1)).toEqual(['a', 'c', 'b'])
})

test('moveInOrder: 先頭を上に移動しても変化しない', () => {
  expect(moveInOrder(['a', 'b'], 'a', -1)).toEqual(['a', 'b'])
})

test('moveInOrder: 末尾を下に移動しても変化しない', () => {
  expect(moveInOrder(['a', 'b'], 'b', 1)).toEqual(['a', 'b'])
})

test('moveInOrder: 存在しないIDなら変化しない', () => {
  expect(moveInOrder(['a', 'b'], 'x', 1)).toEqual(['a', 'b'])
})
