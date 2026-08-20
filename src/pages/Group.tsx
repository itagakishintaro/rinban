import { useParams } from 'react-router-dom'

export default function Group() {
  const { groupId } = useParams()
  return (
    <main className="mx-auto max-w-xl p-8">
      <h1 className="text-3xl font-bold">グループ</h1>
      <p className="mt-2 text-gray-600">ID: {groupId}</p>
    </main>
  )
}
