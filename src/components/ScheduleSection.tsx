import type { Group } from '../types'
import { schedule } from '../domain/rotation'
import { todayInTokyo, formatJa } from '../domain/dates'

const COUNT = 10

export default function ScheduleSection({ group }: { group: Group }) {
  if (!group.rotation) {
    return <p className="mt-8 text-gray-500">ローテーションを設定すると予定が表示されます。</p>
  }
  if (group.order.length === 0) {
    return <p className="mt-8 text-gray-500">メンバーを追加すると予定が表示されます。</p>
  }

  const items = schedule(group, todayInTokyo(), COUNT)

  return (
    <section className="mt-8">
      <h2 className="text-xl font-bold">今後の予定</h2>
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
          </li>
        ))}
      </ol>
    </section>
  )
}
