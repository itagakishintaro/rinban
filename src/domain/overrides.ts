import type { Group } from '../types'
import { assigneeFor } from './rotation'

// date1とdate2の担当を交換したoverridesを返す。担当が計算できなければnull
export function swapAssignees(
  group: Group,
  date1: string,
  date2: string,
): Record<string, string> | null {
  const a = assigneeFor(group, date1)
  const b = assigneeFor(group, date2)
  if (!a || !b) return null
  return { ...group.overrides, [date1]: b.id, [date2]: a.id }
}

// 指定日のoverrideエントリを削除したoverridesを返す
export function removeOverride(
  overrides: Record<string, string>,
  date: string,
): Record<string, string> {
  const next = { ...overrides }
  delete next[date]
  return next
}
