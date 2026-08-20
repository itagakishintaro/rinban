// 作成時のブラウザにだけ所有フラグを残し、アーカイブ・復元の操作UIを出し分ける。
// localStorageによるUI制御であり、消えると操作権を失う(調整さんと同じ制約)

function key(groupId: string): string {
  return `rinban:owner:${groupId}`
}

export function markOwned(groupId: string): void {
  try {
    localStorage.setItem(key(groupId), '1')
  } catch {
    // 保存できない環境では所有者扱いにならないだけ
  }
}

export function isOwned(groupId: string): boolean {
  try {
    return localStorage.getItem(key(groupId)) === '1'
  } catch {
    return false
  }
}
