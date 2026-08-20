export const GROUP_NAME_MAX = 50

// 有効ならtrim済みの名前を、無効ならnullを返す
export function validateGroupName(raw: string): string | null {
  const name = raw.trim()
  if (name.length === 0 || name.length > GROUP_NAME_MAX) return null
  return name
}
