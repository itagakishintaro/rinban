import { useState } from 'react'
import type { CustomRotation } from '../types'
import { rotationLabel } from '../domain/rotation'
import { addDays } from '../domain/dates'

const UNITS = [
  { value: 'day', label: '日ごと' },
  { value: 'week', label: '週間ごと' },
  { value: 'month', label: 'か月ごと' },
  { value: 'year', label: '年ごと' },
] as const

// 月曜はじまりの曜日ピル
const WEEKDAY_PILLS = [
  { wd: 1, label: '月' },
  { wd: 2, label: '火' },
  { wd: 3, label: '水' },
  { wd: 4, label: '木' },
  { wd: 5, label: '金' },
  { wd: 6, label: '土' },
  { wd: 0, label: '日' },
]

type Props = {
  anchorDate: string
  initial: CustomRotation | null
  onCancel: () => void
  onDone: (rotation: CustomRotation) => void
}

export default function CustomRotationDialog({ anchorDate, initial, onCancel, onDone }: Props) {
  const [interval, setInterval] = useState(initial?.interval ?? 1)
  const [unit, setUnit] = useState<CustomRotation['unit']>(initial?.unit ?? 'week')
  const [weekdays, setWeekdays] = useState<number[]>(
    initial?.weekdays ?? [new Date(`${anchorDate}T00:00:00Z`).getUTCDay()],
  )
  const [monthlyMode, setMonthlyMode] = useState<'day' | 'nthWeekday'>(
    initial?.monthlyMode ?? 'day',
  )
  const [endsType, setEndsType] = useState<'none' | 'until' | 'count'>(initial?.ends?.type ?? 'none')
  const [untilDate, setUntilDate] = useState(
    initial?.ends?.type === 'until' ? initial.ends.date : addDays(anchorDate, 90),
  )
  const [count, setCount] = useState(initial?.ends?.type === 'count' ? initial.ends.count : 10)

  function toggleWeekday(wd: number) {
    setWeekdays((prev) => {
      if (prev.includes(wd)) {
        return prev.length > 1 ? prev.filter((w) => w !== wd) : prev // 最低1つは残す
      }
      return [...prev, wd]
    })
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    onDone({
      type: 'custom',
      anchorDate,
      interval: Math.max(1, interval),
      unit,
      ...(unit === 'week' && { weekdays }),
      ...(unit === 'month' && { monthlyMode }),
      ...(endsType === 'until' && untilDate && { ends: { type: 'until', date: untilDate } }),
      ...(endsType === 'count' && { ends: { type: 'count', count: Math.max(1, count) } }),
    })
  }

  const monthLabel = (mode: 'day' | 'nthWeekday') =>
    rotationLabel({ type: 'custom', anchorDate, interval: 1, unit: 'month', monthlyMode: mode })
      .replace('1か月ごと(', '毎月')
      .replace(')', '')

  const input = 'rounded-xl border-2 border-cream-line px-3 py-2'

  return (
    <div className="fixed inset-0 z-10 grid place-items-center bg-black/30 p-4">
      <form
        role="dialog"
        aria-label="カスタムの繰り返し"
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-(--shadow-yuru)"
      >
        <h2 className="font-maru text-lg font-bold">カスタムの繰り返し</h2>

        <div className="mt-4 flex items-center gap-2">
          <label htmlFor="custom-interval" className="text-sm text-soft">
            繰り返す間隔:
          </label>
          <input
            id="custom-interval"
            aria-label="繰り返す間隔"
            type="number"
            min={1}
            max={99}
            value={interval}
            onChange={(e) => setInterval(Number(e.target.value))}
            className={`${input} w-20`}
          />
          <select
            aria-label="単位"
            value={unit}
            onChange={(e) => setUnit(e.target.value as CustomRotation['unit'])}
            className={`${input} bg-white`}
          >
            {UNITS.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </select>
        </div>

        {unit === 'week' && (
          <div className="mt-4">
            <p className="text-sm text-soft">曜日:</p>
            <div className="mt-2 flex gap-1.5">
              {WEEKDAY_PILLS.map(({ wd, label }) => (
                <button
                  key={wd}
                  type="button"
                  aria-pressed={weekdays.includes(wd)}
                  onClick={() => toggleWeekday(wd)}
                  className={`grid h-9 w-9 place-items-center rounded-full text-sm font-bold ${
                    weekdays.includes(wd)
                      ? 'bg-wakaba text-white'
                      : 'border border-cream-line text-soft'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {unit === 'month' && (
          <div className="mt-4">
            <label htmlFor="custom-monthly-mode" className="text-sm text-soft">
              月の繰り返し方:
            </label>
            <select
              id="custom-monthly-mode"
              value={monthlyMode}
              onChange={(e) => setMonthlyMode(e.target.value as 'day' | 'nthWeekday')}
              className={`${input} mt-1 block bg-white`}
            >
              <option value="day">{monthLabel('day')}</option>
              <option value="nthWeekday">{monthLabel('nthWeekday')}</option>
            </select>
          </div>
        )}

        <fieldset className="mt-4">
          <legend className="text-sm text-soft">終了</legend>
          <div className="mt-2 grid gap-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="ends"
                checked={endsType === 'none'}
                onChange={() => setEndsType('none')}
              />
              なし
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="ends"
                aria-label="終了日"
                checked={endsType === 'until'}
                onChange={() => setEndsType('until')}
              />
              終了日:
              <input
                aria-label="繰り返しの終了日"
                type="date"
                value={untilDate}
                onChange={(e) => setUntilDate(e.target.value)}
                disabled={endsType !== 'until'}
                className={`${input} disabled:opacity-40`}
              />
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="ends"
                aria-label="回数"
                checked={endsType === 'count'}
                onChange={() => setEndsType('count')}
              />
              繰り返し:
              <input
                aria-label="繰り返す回数"
                type="number"
                min={1}
                max={999}
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                disabled={endsType !== 'count'}
                className={`${input} w-24 disabled:opacity-40`}
              />
              回
            </label>
          </div>
        </fieldset>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-cream-line px-4 py-2 text-sm text-soft"
          >
            キャンセル
          </button>
          <button
            type="submit"
            className="rounded-full bg-wakaba px-5 py-2 text-sm font-bold text-white"
          >
            完了
          </button>
        </div>
      </form>
    </div>
  )
}
