import { useState } from 'react'
import type { Group, RotationType } from '../types'
import { rotationLabel } from '../domain/rotation'
import { updateGroup } from '../lib/groups'
import { todayInTokyo } from '../domain/dates'

const TYPES: RotationType[] = ['daily', 'weekly', 'monthlyNthWeekday', 'yearly', 'weekdays']

// 保存ボタンはなく、開始日・繰り返しを変更した瞬間に保存する(選択=即保存)
export default function RotationSection({ groupId, group }: { groupId: string; group: Group }) {
  const r = group.rotation
  const [draftAnchor, setDraftAnchor] = useState(todayInTokyo())
  const anchorDate = r?.anchorDate ?? draftAnchor

  async function onAnchorChange(value: string) {
    if (!value) return
    setDraftAnchor(value)
    if (r) await updateGroup(groupId, { rotation: { type: r.type, anchorDate: value } })
  }

  async function onTypeChange(type: RotationType) {
    await updateGroup(groupId, { rotation: { type, anchorDate } })
  }

  return (
    <section className="mt-6 rounded-2xl bg-white p-5 shadow-(--shadow-yuru-sm)">
      <h2 className="font-maru text-sm font-bold text-wakaba">ローテーション</h2>

      <div className="mt-3 flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="rotation-anchor" className="block text-sm text-soft">
            開始日
          </label>
          <input
            id="rotation-anchor"
            type="date"
            value={anchorDate}
            onChange={(e) => onAnchorChange(e.target.value)}
            className="mt-1 rounded-xl border-2 border-cream-line px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="rotation-type" className="block text-sm text-soft">
            繰り返し
          </label>
          <select
            id="rotation-type"
            value={r?.type ?? ''}
            onChange={(e) => onTypeChange(e.target.value as RotationType)}
            className="mt-1 rounded-xl border-2 border-cream-line bg-white px-3 py-2"
          >
            <option value="" disabled>
              選択してください
            </option>
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {rotationLabel(t, anchorDate)}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  )
}
