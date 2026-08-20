import { useState } from 'react'
import type { Group, Member } from '../types'
import { schedule, isEnded } from '../domain/rotation'
import { swapAssignees, removeOverride } from '../domain/overrides'
import { todayInTokyo, formatJa } from '../domain/dates'
import { updateGroup } from '../lib/groups'

const COUNT = 10

export default function ScheduleSection({ groupId, group }: { groupId: string; group: Group }) {
  // 入れ替え元として選択中の日付
  const [swapFrom, setSwapFrom] = useState<string | null>(null)

  if (isEnded(group, todayInTokyo())) {
    return <p className="mt-8 text-soft">この輪番は終了しました。</p>
  }
  if (!group.rotation) {
    return <p className="mt-8 text-soft">ローテーションを設定すると予定が表示されます。</p>
  }
  if (group.order.length === 0) {
    return <p className="mt-8 text-soft">メンバーを追加すると予定が表示されます。</p>
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

  function actions(date: string) {
    if (swapFrom === null) {
      return (
        <>
          <button
            onClick={() => setSwapFrom(date)}
            className="rounded-full border border-cream-line px-3 py-1 text-sm text-soft"
          >
            入れ替え
          </button>
          {isOverridden(date) && (
            <button
              onClick={() => onCancelOverride(date)}
              className="rounded-full border border-amber-soft px-3 py-1 text-sm text-amber-ink"
            >
              取り消し
            </button>
          )}
        </>
      )
    }
    if (swapFrom === date) {
      return <span className="text-sm text-wakaba">この回を入れ替えます</span>
    }
    return (
      <button
        onClick={() => onSwap(date)}
        className="rounded-full bg-wakaba-soft px-3 py-1 text-sm font-bold text-wakaba"
      >
        この回と入れ替え
      </button>
    )
  }

  function overriddenChip(date: string) {
    return (
      isOverridden(date) && (
        <span className="rounded-full bg-amber-soft px-2.5 py-0.5 text-xs text-amber-ink">
          入れ替え済み
        </span>
      )
    )
  }

  function heroCard(date: string, member: Member | null) {
    return (
      <li
        key={date}
        className="mb-4 rounded-3xl bg-white p-6 text-center shadow-(--shadow-yuru)"
      >
        <p className="text-xs tracking-widest text-soft">つぎの担当</p>
        <div className="mx-auto mt-3 grid h-16 w-16 place-items-center rounded-full bg-wakaba-soft font-maru text-2xl font-bold text-wakaba">
          {member?.name.charAt(0) ?? '?'}
        </div>
        <p className="mt-2 font-maru text-xl font-bold">{member?.name ?? '未定'}</p>
        <p className="text-sm text-soft">{formatJa(date)}</p>
        <div className="mt-3 flex items-center justify-center gap-2">
          {overriddenChip(date)}
          {actions(date)}
        </div>
      </li>
    )
  }

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between">
        <h2 className="font-maru text-lg font-bold text-wakaba">今後の予定</h2>
        {swapFrom !== null && (
          <button
            onClick={() => setSwapFrom(null)}
            className="rounded-full border border-cream-line px-3 py-1 text-sm text-soft"
          >
            入れ替えをやめる
          </button>
        )}
      </div>
      {swapFrom !== null && (
        <p className="mt-2 text-sm text-wakaba">入れ替える相手の回を選んでください。</p>
      )}

      <ol aria-label="予定一覧" className="mt-3">
        {items.map(({ date, member }, i) =>
          i === 0 ? (
            heroCard(date, member)
          ) : (
            <li
              key={date}
              className={`flex items-center gap-3 bg-white px-5 py-2.5 shadow-(--shadow-yuru-sm) ${
                i === 1 ? 'rounded-t-2xl' : 'border-t border-dashed border-cream-line'
              } ${i === items.length - 1 ? 'rounded-b-2xl' : ''}`}
            >
              <span className="w-28 text-sm text-soft">{formatJa(date)}</span>
              <span className="font-bold">{member?.name ?? '未定'}</span>
              {overriddenChip(date)}
              <span className="ml-auto flex items-center gap-2">{actions(date)}</span>
            </li>
          ),
        )}
      </ol>
    </section>
  )
}
