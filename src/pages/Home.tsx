import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createGroup } from '../lib/groups'
import { validateGroupName, GROUP_NAME_MAX } from '../lib/validation'

export default function Home() {
  const [name, setName] = useState('')
  const [creating, setCreating] = useState(false)
  const navigate = useNavigate()

  const valid = validateGroupName(name) !== null

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const groupName = validateGroupName(name)
    if (!groupName || creating) return
    setCreating(true)
    try {
      const id = await createGroup(groupName)
      navigate(`/g/${id}`)
    } finally {
      setCreating(false)
    }
  }

  return (
    <main className="mx-auto max-w-xl p-8">
      <h1 className="text-3xl font-bold">Rinban</h1>
      <p className="mt-2 text-gray-600">輪番をかんたんに管理</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <label htmlFor="group-name" className="block text-sm font-medium">
            グループ名
          </label>
          <input
            id="group-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={GROUP_NAME_MAX}
            placeholder="例: 朝会司会"
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
          />
        </div>
        <button
          type="submit"
          disabled={!valid || creating}
          className="rounded bg-blue-600 px-4 py-2 font-medium text-white disabled:opacity-40"
        >
          作成
        </button>
      </form>
    </main>
  )
}
