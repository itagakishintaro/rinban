import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useGroup } from '../hooks/useGroup'
import { recordVisit } from '../lib/recentGroups'
import MemberSection from '../components/MemberSection'
import ShareSection from '../components/ShareSection'
import AdminSection from '../components/AdminSection'
import { updateGroup } from '../lib/groups'
import { isOwned } from '../lib/ownedGroups'
import RotationSection from '../components/RotationSection'
import ScheduleSection from '../components/ScheduleSection'

export default function Group() {
  const { groupId } = useParams()
  const state = useGroup(groupId!)
  const groupName = state.status === 'ready' ? state.group.name : null

  useEffect(() => {
    if (groupName) recordVisit(groupId!, groupName)
  }, [groupId, groupName])

  if (state.status === 'loading') {
    return <main className="mx-auto max-w-xl p-8 text-gray-500">読み込み中...</main>
  }
  if (state.status === 'notfound') {
    return (
      <main className="mx-auto max-w-xl p-8">
        <h1 className="text-3xl font-bold">グループが見つかりません</h1>
        <p className="mt-2 text-gray-600">URLが正しいか確認してください。</p>
      </main>
    )
  }
  if (state.group.archived) {
    return (
      <main className="mx-auto max-w-xl p-8">
        <h1 className="text-3xl font-bold">{state.group.name}</h1>
        <div className="mt-6 rounded border border-amber-300 bg-amber-50 p-4">
          <p>この輪番はアーカイブされています。</p>
          {isOwned(groupId!) && (
            <button
              onClick={() => updateGroup(groupId!, { archived: false })}
              className="mt-3 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white"
            >
              復元する
            </button>
          )}
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-xl p-8">
      <h1 className="text-3xl font-bold">{state.group.name}</h1>
      <ShareSection />
      <ScheduleSection groupId={groupId!} group={state.group} />
      <RotationSection groupId={groupId!} group={state.group} />
      <MemberSection groupId={groupId!} group={state.group} />
      <AdminSection groupId={groupId!} group={state.group} />
    </main>
  )
}
