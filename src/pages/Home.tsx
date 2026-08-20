import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createGroup } from '../lib/groups'
import { validateName, NAME_MAX } from '../lib/validation'
import { loadRecentGroups } from '../lib/recentGroups'
import { markOwned } from '../lib/ownedGroups'

export default function Home() {
  const [name, setName] = useState('')
  const [creating, setCreating] = useState(false)
  const [recent] = useState(loadRecentGroups)
  const navigate = useNavigate()

  const valid = validateName(name) !== null

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const groupName = validateName(name)
    if (!groupName || creating) return
    setCreating(true)
    try {
      const id = await createGroup(groupName)
      markOwned(id)
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
            maxLength={NAME_MAX}
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

      {recent.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-bold">最近見た輪番</h2>
          <ul aria-label="最近見た輪番" className="mt-3 divide-y divide-gray-200">
            {recent.map((g) => (
              <li key={g.id}>
                <Link
                  to={`/g/${g.id}`}
                  className="block py-2 text-blue-700 hover:underline"
                >
                  {g.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  )
}
