import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useGroup } from '../hooks/useGroup'
import { recordVisit } from '../lib/recentGroups'
import ScheduleSection from '../components/ScheduleSection'
import RotationSection from '../components/RotationSection'
import MemberSection from '../components/MemberSection'
import ShareSection from '../components/ShareSection'
import AdminSection from '../components/AdminSection'
import { updateGroup } from '../lib/groups'
import { isOwned } from '../lib/ownedGroups'

export default function Group() {
  const { groupId } = useParams()
  const state = useGroup(groupId!)
  const groupName = state.status === 'ready' ? state.group.name : null

  useEffect(() => {
    if (groupName) recordVisit(groupId!, groupName)
  }, [groupId, groupName])

  if (state.status === 'loading') {
    return <main className="mx-auto max-w-xl px-6 pt-6 text-soft">読み込み中...</main>
  }
  if (state.status === 'notfound') {
    return (
      <main className="mx-auto max-w-xl px-6 pt-6">
        <h1 className="font-maru text-2xl font-bold">グループが見つかりません</h1>
        <p className="mt-2 text-soft">URLが正しいか確認してください。</p>
      </main>
    )
  }
  if (state.group.archived) {
    return (
      <main className="mx-auto max-w-xl px-6 pt-6 pb-16">
        <h1 className="font-maru text-2xl font-bold">{state.group.name}</h1>
        <div className="mt-6 rounded-2xl bg-amber-soft p-5">
          <p className="text-amber-ink">この輪番はアーカイブされています。</p>
          {isOwned(groupId!) && (
            <button
              onClick={() => updateGroup(groupId!, { archived: false })}
              className="mt-3 rounded-full bg-wakaba px-4 py-2 text-sm font-bold text-white"
            >
              復元する
            </button>
          )}
        </div>
      </main>
    )
  }
  return (
    <main className="mx-auto max-w-xl px-6 pt-2 pb-16">
      <h1 className="font-maru text-2xl font-bold">{state.group.name}</h1>
      <ScheduleSection groupId={groupId!} group={state.group} />
      <ShareSection />
      <RotationSection groupId={groupId!} group={state.group} />
      <MemberSection groupId={groupId!} group={state.group} />
      <AdminSection groupId={groupId!} group={state.group} />
    </main>
  )
}
