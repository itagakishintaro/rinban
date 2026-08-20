import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

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
