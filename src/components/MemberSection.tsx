import { useState } from 'react'
import type { Group } from '../types'
import { addMember, renameMember, removeMember, membersInOrder, moveInOrder } from '../domain/members'
import { updateGroup } from '../lib/groups'
import { validateName, NAME_MAX } from '../lib/validation'

const MEMBER_MAX = 50

export default function MemberSection({ groupId, group }: { groupId: string; group: Group }) {
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const members = membersInOrder(group)
  const full = group.members.length >= MEMBER_MAX

  async function onAdd(e: React.FormEvent) {
    e.preventDefault()
    const name = validateName(newName)
    if (!name || full) return
    setNewName('') // await後にクリアすると次の入力を消す競合が起きるため先に行う
    await updateGroup(groupId, addMember(group, { id: crypto.randomUUID(), name }))
  }

  async function onRename(e: React.FormEvent) {
    e.preventDefault()
    const name = validateName(editName)
    if (!name || editingId === null) return
    const id = editingId
    setEditingId(null)
    await updateGroup(groupId, { members: renameMember(group.members, id, name) })
  }

  async function onRemove(id: string) {
    await updateGroup(groupId, removeMember(group, id))
  }

  async function onMove(id: string, delta: -1 | 1) {
    await updateGroup(groupId, { order: moveInOrder(group.order, id, delta) })
  }

  const iconBtn =
    'grid h-8 w-8 place-items-center rounded-full border border-cream-line text-sm text-soft disabled:opacity-30'

  return (
    <section className="mt-6 rounded-2xl bg-white p-5 shadow-(--shadow-yuru-sm)">
      <h2 className="font-maru text-sm font-bold text-wakaba">メンバー</h2>

      <ul aria-label="メンバー一覧" className="mt-2">
        {members.map((m, i) =>
          editingId === m.id ? (
            <li key={m.id} className={`py-2 ${i > 0 ? 'border-t border-dashed border-cream-line' : ''}`}>
              <form onSubmit={onRename} className="flex items-center gap-2">
                <input
                  aria-label="新しいメンバー名"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  maxLength={NAME_MAX}
                  autoFocus
                  className="w-full rounded-xl border-2 border-cream-line px-3 py-1.5"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-full bg-wakaba-soft px-3 py-1.5 text-sm font-bold text-wakaba"
                >
                  保存
                </button>
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="shrink-0 rounded-full border border-cream-line px-3 py-1.5 text-sm text-soft"
                >
                  キャンセル
                </button>
              </form>
            </li>
          ) : (
            <li
              key={m.id}
              className={`flex items-center gap-3 py-2 ${i > 0 ? 'border-t border-dashed border-cream-line' : ''}`}
            >
              <span className="grid h-8 w-8 place-items-center rounded-full bg-wakaba-soft font-maru text-sm font-bold text-wakaba">
                {m.name.charAt(0)}
              </span>
              <span className="font-bold">{m.name}</span>
              <span className="ml-auto flex gap-1.5">
                <button
                  aria-label={`${m.name}を上に移動`}
                  onClick={() => onMove(m.id, -1)}
                  disabled={i === 0}
                  className={iconBtn}
                >
                  ↑
                </button>
                <button
                  aria-label={`${m.name}を下に移動`}
                  onClick={() => onMove(m.id, 1)}
                  disabled={i === members.length - 1}
                  className={iconBtn}
                >
                  ↓
                </button>
                <button
                  aria-label={`${m.name}を変更`}
                  onClick={() => {
                    setEditingId(m.id)
                    setEditName(m.name)
                  }}
                  className="rounded-full border border-cream-line px-3 py-1 text-sm text-soft"
                >
                  変更
                </button>
                <button
                  aria-label={`${m.name}を削除`}
                  onClick={() => onRemove(m.id)}
                  className="rounded-full border border-red-200 px-3 py-1 text-sm text-red-500"
                >
                  削除
                </button>
              </span>
            </li>
          ),
        )}
      </ul>

      <form onSubmit={onAdd} className="mt-3 flex items-end gap-2">
        <div className="grow">
          <label htmlFor="member-name" className="block text-sm text-soft">
            メンバー名
          </label>
          <input
            id="member-name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            maxLength={NAME_MAX}
            placeholder="例: 田中"
            className="mt-1 w-full rounded-xl border-2 border-cream-line px-3 py-2"
          />
        </div>
        <button
          type="submit"
          disabled={validateName(newName) === null || full}
          className="shrink-0 rounded-full bg-wakaba px-4 py-2 text-sm font-bold text-white disabled:opacity-40"
        >
          追加
        </button>
      </form>
      {full && <p className="mt-2 text-sm text-red-500">メンバーは最大{MEMBER_MAX}人です</p>}
    </section>
  )
}
