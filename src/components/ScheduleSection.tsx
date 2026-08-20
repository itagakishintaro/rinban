import { useState } from 'react'
import type { Group } from '../types'
import { schedule } from '../domain/rotation'
import { swapAssignees, removeOverride } from '../domain/overrides'
import { todayInTokyo, formatJa } from '../domain/dates'
import { updateGroup } from '../lib/groups'

const COUNT = 10

export default function ScheduleSection({ groupId, group }: { groupId: string; group: Group }) {
  // 入れ替え元として選択中の日付
  const [swapFrom, setSwapFrom] = useState<string | null>(null)

  if (!group.rotation) {
    return <p className="mt-8 text-gray-500">ローテーションを設定すると予定が表示されます。</p>
  }
  if (group.order.length === 0) {
    return <p className="mt-8 text-gray-500">メンバーを追加すると予定が表示されます。</p>
  }

  const items = schedule(group, todayInTokyo(), COUNT)

  async function onSwap(date: string) {
    if (swapFrom === null) return
    const overrides = swapAssignees(group, swapFrom, date)
    setSwapFrom(null)
    if (overrides) await updateGroup(groupId, { overrides })
  }

  async function onCancelOverride(date: string) {
    await updateGroup(groupId, { overrides: removeOverride(group.overrides, date) })
  }

  const isOverridden = (date: string) =>
    date in group.overrides && group.members.some((m) => m.id === group.overrides[date])

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">今後の予定</h2>
        {swapFrom !== null && (
          <button
            onClick={() => setSwapFrom(null)}
            className="rounded border border-gray-300 px-3 py-1 text-sm"
          >
            入れ替えをやめる
          </button>
        )}
      </div>
      {swapFrom !== null && (
        <p className="mt-2 text-sm text-blue-700">入れ替える相手の回を選んでください。</p>
      )}

      <ol aria-label="予定一覧" className="mt-4 divide-y divide-gray-200">
        {items.map(({ date, member }, i) => (
          <li key={date} className="flex items-center gap-3 py-2">
            {i === 0 && (
              <span className="rounded bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">
                次回
              </span>
            )}
            <span className="w-28 text-gray-600">{formatJa(date)}</span>
            <span className="font-medium">{member?.name ?? '未定'}</span>
            {isOverridden(date) && (
              <span className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
                入れ替え済み
              </span>
            )}
            <span className="ml-auto flex gap-2">
              {swapFrom === null ? (
                <>
                  <button
                    onClick={() => setSwapFrom(date)}
                    className="rounded border border-gray-300 px-3 py-1 text-sm"
                  >
                    入れ替え
                  </button>
                  {isOverridden(date) && (
                    <button
                      onClick={() => onCancelOverride(date)}
                      className="rounded border border-amber-300 px-3 py-1 text-sm text-amber-700"
                    >
                      取り消し
                    </button>
                  )}
                </>
              ) : swapFrom === date ? (
                <span className="text-sm text-blue-700">この回を入れ替えます</span>
              ) : (
                <button
                  onClick={() => onSwap(date)}
                  className="rounded bg-blue-600 px-3 py-1 text-sm font-medium text-white"
                >
                  この回と入れ替え
                </button>
              )}
            </span>
          </li>
        ))}
      </ol>
    </section>
  )
}
