import { useState } from 'react'
import type { Group, RotationType } from '../types'
import { rotationLabel } from '../domain/rotation'
import { updateGroup } from '../lib/groups'
import { todayInTokyo, formatJa } from '../domain/dates'

const TYPES: RotationType[] = ['daily', 'weekly', 'monthlyNthWeekday', 'yearly', 'weekdays']

export default function RotationSection({ groupId, group }: { groupId: string; group: Group }) {
  const r = group.rotation
  const [editing, setEditing] = useState(false)
  const [type, setType] = useState<RotationType>(r?.type ?? 'weekly')
  const [anchorDate, setAnchorDate] = useState(r?.anchorDate ?? todayInTokyo())

  function startEdit() {
    if (r) {
      setType(r.type)
      setAnchorDate(r.anchorDate)
    }
    setEditing(true)
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault()
    if (!anchorDate) return
    setEditing(false)
    await updateGroup(groupId, { rotation: { type, anchorDate } })
  }

  return (
    <section className="mt-8">
      <h2 className="text-xl font-bold">ローテーション</h2>

      {r && !editing ? (
        <div className="mt-4 flex items-center justify-between">
          <p>
            {rotationLabel(r.type, r.anchorDate)}(開始日: {formatJa(r.anchorDate)})
          </p>
          <button
            onClick={startEdit}
            className="rounded border border-gray-300 px-3 py-1 text-sm"
          >
            ローテーションを変更
          </button>
        </div>
      ) : (
        <form onSubmit={onSave} className="mt-4 flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="rotation-anchor" className="block text-sm font-medium">
              開始日
            </label>
            <input
              id="rotation-anchor"
              type="date"
              value={anchorDate}
              onChange={(e) => setAnchorDate(e.target.value)}
              required
              className="mt-1 rounded border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label htmlFor="rotation-type" className="block text-sm font-medium">
              繰り返し
            </label>
            <select
              id="rotation-type"
              value={type}
              onChange={(e) => setType(e.target.value as RotationType)}
              className="mt-1 rounded border border-gray-300 px-3 py-2"
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {rotationLabel(t, anchorDate)}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="rounded bg-blue-600 px-4 py-2 font-medium text-white">
            設定を保存
          </button>
        </form>
      )}
    </section>
  )
}
