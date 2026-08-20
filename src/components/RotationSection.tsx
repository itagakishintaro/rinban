import { useState } from 'react'
import type { Group, Rotation } from '../types'
import { updateGroup } from '../lib/groups'
import { todayInTokyo, formatJa } from '../domain/dates'

const WEEKDAYS = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日']
const TYPE_LABEL = { weekly: '毎週', biweekly: '隔週', monthly: '毎月' } as const

function describe(r: Rotation): string {
  const cycle =
    r.type === 'monthly' ? `毎月 ${r.dayOfMonth}日` : `${TYPE_LABEL[r.type]} ${WEEKDAYS[r.weekday!]}`
  return `${cycle}(開始日: ${formatJa(r.anchorDate)})`
}

export default function RotationSection({ groupId, group }: { groupId: string; group: Group }) {
  const r = group.rotation
  const [editing, setEditing] = useState(false)
  const [type, setType] = useState<Rotation['type']>(r?.type ?? 'weekly')
  const [weekday, setWeekday] = useState(r?.weekday ?? 1)
  const [dayOfMonth, setDayOfMonth] = useState(r?.dayOfMonth ?? 1)
  const [anchorDate, setAnchorDate] = useState(r?.anchorDate ?? todayInTokyo())

  function startEdit() {
    if (r) {
      setType(r.type)
      setWeekday(r.weekday ?? 1)
      setDayOfMonth(r.dayOfMonth ?? 1)
      setAnchorDate(r.anchorDate)
    }
    setEditing(true)
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault()
    setEditing(false)
    const rotation: Rotation =
      type === 'monthly' ? { type, dayOfMonth, anchorDate } : { type, weekday, anchorDate }
    await updateGroup(groupId, { rotation })
  }

  return (
    <section className="mt-8">
      <h2 className="text-xl font-bold">ローテーション</h2>

      {r && !editing ? (
        <div className="mt-4 flex items-center justify-between">
          <p>{describe(r)}</p>
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
            <label htmlFor="rotation-type" className="block text-sm font-medium">
              周期
            </label>
            <select
              id="rotation-type"
              value={type}
              onChange={(e) => setType(e.target.value as Rotation['type'])}
              className="mt-1 rounded border border-gray-300 px-3 py-2"
            >
              <option value="weekly">毎週</option>
              <option value="biweekly">隔週</option>
              <option value="monthly">毎月</option>
            </select>
          </div>

          {type === 'monthly' ? (
            <div>
              <label htmlFor="rotation-day" className="block text-sm font-medium">
                日にち
              </label>
              <select
                id="rotation-day"
                value={dayOfMonth}
                onChange={(e) => setDayOfMonth(Number(e.target.value))}
                className="mt-1 rounded border border-gray-300 px-3 py-2"
              >
                {Array.from({ length: 31 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}日
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label htmlFor="rotation-weekday" className="block text-sm font-medium">
                曜日
              </label>
              <select
                id="rotation-weekday"
                value={weekday}
                onChange={(e) => setWeekday(Number(e.target.value))}
                className="mt-1 rounded border border-gray-300 px-3 py-2"
              >
                {WEEKDAYS.map((label, i) => (
                  <option key={i} value={i}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label htmlFor="rotation-anchor" className="block text-sm font-medium">
              開始日
            </label>
            <input
              id="rotation-anchor"
              type="date"
              value={anchorDate}
              onChange={(e) => setAnchorDate(e.target.value)}
              className="mt-1 rounded border border-gray-300 px-3 py-2"
            />
          </div>

          <button
            type="submit"
            className="rounded bg-blue-600 px-4 py-2 font-medium text-white"
          >
            設定を保存
          </button>
        </form>
      )}
    </section>
  )
}
