import { test, expect } from 'vitest'
import { addMember, renameMember, removeMember, membersInOrder } from './members'

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
