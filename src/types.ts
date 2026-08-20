export type Member = {
  id: string
  name: string
}

export type Rotation = {
  type: 'weekly' | 'biweekly' | 'monthly'
  weekday?: number
  dayOfMonth?: number
  anchorDate: string
}

export type Group = {
  name: string
  members: Member[]
  order: string[]
  rotation?: Rotation
  overrides: Record<string, string>
}
