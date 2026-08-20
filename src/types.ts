export type Member = {
  id: string
  name: string
}

export type PresetRotationType = 'daily' | 'weekly' | 'weekdays' | 'monthlyNthWeekday' | 'yearly'
export type RotationType = PresetRotationType | 'custom'

export type PresetRotation = {
  type: PresetRotationType
  anchorDate: string // 'YYYY-MM-DD'。開始日。曜日・第N・月日はすべてここから導出
}

export type CustomEnds =
  | { type: 'until'; date: string } // この日まで
  | { type: 'count'; count: number } // 通算N回まで

export type CustomRotation = {
  type: 'custom'
  anchorDate: string
  interval: number // 繰り返す間隔(1以上)
  unit: 'day' | 'week' | 'month' | 'year'
  weekdays?: number[] // unit=weekのみ。0(日)〜6(土)、複数選択
  monthlyMode?: 'day' | 'nthWeekday' // unit=monthのみ。毎月N日 or 第N X曜日
  ends?: CustomEnds // 省略=終了なし
}

export type Rotation = PresetRotation | CustomRotation

export type Group = {
  name: string
  members: Member[]
  order: string[]
  rotation?: Rotation
  overrides: Record<string, string>
  endDate?: string // 'YYYY-MM-DD'。これより後の開催はない
  archived?: boolean
}
