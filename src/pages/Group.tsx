import { useParams } from 'react-router-dom'
import { useGroup } from '../hooks/useGroup'
import MemberSection from '../components/MemberSection'
import ShareSection from '../components/ShareSection'
import RotationSection from '../components/RotationSection'
import ScheduleSection from '../components/ScheduleSection'

export default function Group() {
  const { groupId } = useParams()
  const state = useGroup(groupId!)

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
  return (
    <main className="mx-auto max-w-xl p-8">
      <h1 className="text-3xl font-bold">{state.group.name}</h1>
      <ShareSection />
      <ScheduleSection groupId={groupId!} group={state.group} />
      <RotationSection groupId={groupId!} group={state.group} />
      <MemberSection groupId={groupId!} group={state.group} />
    </main>
  )
}
