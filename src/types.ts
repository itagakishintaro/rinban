export type Member = {
  id: string
  name: string
}

export type RotationType = 'daily' | 'weekly' | 'weekdays' | 'monthlyNthWeekday' | 'yearly'

export type Rotation = {
  type: RotationType
  anchorDate: string // 'YYYY-MM-DD'。開始日。曜日・第N・月日はすべてここから導出
}

export type Group = {
  name: string
  members: Member[]
  order: string[]
  rotation?: Rotation
  overrides: Record<string, string>
  endDate?: string // 'YYYY-MM-DD'。これより後の開催はない
  archived?: boolean
}
