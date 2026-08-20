import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import type { Group } from '../types'

// グループを作成し、共有URLに使うIDを返す
export async function createGroup(name: string): Promise<string> {
  const ref = await addDoc(collection(db, 'groups'), {
    name,
    members: [],
    order: [],
    overrides: {},
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateGroup(groupId: string, data: Partial<Group>): Promise<void> {
  await updateDoc(doc(db, 'groups', groupId), { ...data, updatedAt: serverTimestamp() })
}
