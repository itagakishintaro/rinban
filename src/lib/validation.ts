export const NAME_MAX = 50

// グループ名・メンバー名の共通バリデーション。有効ならtrim済みの名前を、無効ならnullを返す
export function validateName(raw: string): string | null {
  const name = raw.trim()
  if (name.length === 0 || name.length > NAME_MAX) return null
  return name
}
