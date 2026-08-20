export const RECENT_MAX = 20
const STORAGE_KEY = 'rinban:recent'

export type RecentGroup = { id: string; name: string; visitedAt: number }

// 訪問を先頭に追加。既存IDは先頭へ移動し名前・日時を更新。最大RECENT_MAX件
export function upsertRecent(
  list: RecentGroup[],
  visit: { id: string; name: string },
  visitedAt: number,
): RecentGroup[] {
  const rest = list.filter((g) => g.id !== visit.id)
  return [{ ...visit, visitedAt }, ...rest].slice(0, RECENT_MAX)
}

// localStorageは使えない環境(プライベートブラウズ等)があるため失敗は無視する
export function loadRecentGroups(): RecentGroup[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

export function recordVisit(id: string, name: string): void {
  try {
    const next = upsertRecent(loadRecentGroups(), { id, name }, Date.now())
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // 保存できなくても機能に支障はない
  }
}
