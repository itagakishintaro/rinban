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
    <main className="mx-auto max-w-xl px-6 pt-6 pb-16">
      <h1 className="font-maru text-2xl font-bold">輪番をかんたんに管理</h1>
      <p className="mt-2 text-soft">
        朝会の司会や読書会の担当など、交代制の当番をURL共有だけで管理できます。
      </p>

      <form
        onSubmit={onSubmit}
        className="mt-6 rounded-2xl bg-white p-5 shadow-(--shadow-yuru-sm)"
      >
        <label htmlFor="group-name" className="block text-sm text-soft">
          グループ名
        </label>
        <div className="mt-1 flex items-center gap-2">
          <input
            id="group-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={NAME_MAX}
            placeholder="例: 朝会司会"
            className="w-full rounded-xl border-2 border-cream-line px-3 py-2"
          />
          <button
            type="submit"
            disabled={!valid || creating}
            className="shrink-0 rounded-full bg-wakaba px-5 py-2 font-bold text-white disabled:opacity-40"
          >
            作成
          </button>
        </div>
      </form>

      {recent.length > 0 && (
        <section className="mt-8 rounded-2xl bg-white p-5 shadow-(--shadow-yuru-sm)">
          <h2 className="font-maru text-sm font-bold text-wakaba">最近見た輪番</h2>
          <ul aria-label="最近見た輪番" className="mt-2">
            {recent.map((g, i) => (
              <li key={g.id} className={i > 0 ? 'border-t border-dashed border-cream-line' : ''}>
                <Link to={`/g/${g.id}`} className="flex items-center gap-3 py-2.5">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-wakaba-soft font-maru text-sm font-bold text-wakaba">
                    {g.name.charAt(0)}
                  </span>
                  <span className="font-bold">{g.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  )
}
