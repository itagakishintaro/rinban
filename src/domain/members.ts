import type { Member } from '../types'

type MembersAndOrder = { members: Member[]; order: string[] }

export function addMember(group: MembersAndOrder, member: Member): MembersAndOrder {
  return { members: [...group.members, member], order: [...group.order, member.id] }
}

export function renameMember(members: Member[], id: string, name: string): Member[] {
  return members.map((m) => (m.id === id ? { ...m, name } : m))
}

export function removeMember(group: MembersAndOrder, id: string): MembersAndOrder {
  return {
    members: group.members.filter((m) => m.id !== id),
    order: group.order.filter((memberId) => memberId !== id),
  }
}

// orderの中でidを前(-1)または後ろ(+1)の要素と入れ替える。端や無効IDはno-op
export function moveInOrder(order: string[], id: string, delta: -1 | 1): string[] {
  const from = order.indexOf(id)
  const to = from + delta
  if (from === -1 || to < 0 || to >= order.length) return order
  const next = [...order]
  ;[next[from], next[to]] = [next[to], next[from]]
  return next
}

// orderの並びでメンバーを返す。orderに残った無効IDは無視する
export function membersInOrder(group: MembersAndOrder): Member[] {
  const byId = new Map(group.members.map((m) => [m.id, m]))
  return group.order.flatMap((id) => byId.get(id) ?? [])
}
