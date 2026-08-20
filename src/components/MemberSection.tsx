import { useState } from 'react'
import type { Group } from '../types'
import { addMember, renameMember, removeMember, membersInOrder } from '../domain/members'
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

  return (
    <section className="mt-8">
      <h2 className="text-xl font-bold">メンバー</h2>

      <ul aria-label="メンバー一覧" className="mt-4 divide-y divide-gray-200">
        {members.map((m) =>
          editingId === m.id ? (
            <li key={m.id} className="py-2">
              <form onSubmit={onRename} className="flex items-center gap-2">
                <input
                  aria-label="新しいメンバー名"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  maxLength={NAME_MAX}
                  autoFocus
                  className="w-full rounded border border-gray-300 px-3 py-1"
                />
                <button
                  type="submit"
                  className="rounded bg-blue-600 px-3 py-1 font-medium text-white"
                >
                  保存
                </button>
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="rounded border border-gray-300 px-3 py-1"
                >
                  キャンセル
                </button>
              </form>
            </li>
          ) : (
            <li key={m.id} className="flex items-center justify-between py-2">
              <span>{m.name}</span>
              <span className="flex gap-2">
                <button
                  aria-label={`${m.name}を変更`}
                  onClick={() => {
                    setEditingId(m.id)
                    setEditName(m.name)
                  }}
                  className="rounded border border-gray-300 px-3 py-1 text-sm"
                >
                  変更
                </button>
                <button
                  aria-label={`${m.name}を削除`}
                  onClick={() => onRemove(m.id)}
                  className="rounded border border-red-300 px-3 py-1 text-sm text-red-600"
                >
                  削除
                </button>
              </span>
            </li>
          ),
        )}
      </ul>

      <form onSubmit={onAdd} className="mt-4 flex items-end gap-2">
        <div className="grow">
          <label htmlFor="member-name" className="block text-sm font-medium">
            メンバー名
          </label>
          <input
            id="member-name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            maxLength={NAME_MAX}
            placeholder="例: 田中"
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
          />
        </div>
        <button
          type="submit"
          disabled={validateName(newName) === null || full}
          className="rounded bg-blue-600 px-4 py-2 font-medium text-white disabled:opacity-40"
        >
          追加
        </button>
      </form>
      {full && <p className="mt-2 text-sm text-red-600">メンバーは最大{MEMBER_MAX}人です</p>}
    </section>
  )
}
