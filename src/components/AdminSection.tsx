import { deleteField, doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import type { Group } from '../types'
import { db } from '../firebase'
import { updateGroup } from '../lib/groups'
import { isOwned } from '../lib/ownedGroups'

export default function AdminSection({ groupId, group }: { groupId: string; group: Group }) {
  async function onEndDateChange(value: string) {
    if (value) {
      await updateGroup(groupId, { endDate: value })
    } else {
      // 空にしたら終了日を解除
      await updateDoc(doc(db, 'groups', groupId), {
        endDate: deleteField(),
        updatedAt: serverTimestamp(),
      })
    }
  }

  return (
    <section className="mt-6 rounded-2xl border-2 border-dashed border-cream-line p-5">
      <h2 className="font-maru text-sm font-bold text-soft">管理</h2>
      <div className="mt-3 flex flex-wrap items-end gap-6">
        <div>
          <label htmlFor="end-date" className="block text-sm text-soft">
            終了日
          </label>
          <p className="text-sm text-soft">この日を過ぎると予定が表示されなくなります。</p>
          <input
            id="end-date"
            type="date"
            value={group.endDate ?? ''}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="mt-1 rounded-xl border-2 border-cream-line bg-white px-3 py-2"
          />
        </div>
        {isOwned(groupId) && (
          <button
            onClick={() => updateGroup(groupId, { archived: true })}
            className="rounded-full border border-red-200 px-4 py-2 text-sm text-red-500"
          >
            アーカイブする
          </button>
        )}
      </div>
    </section>
  )
}
