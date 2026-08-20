import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import type { Group } from '../types'

export type GroupState =
  | { status: 'loading' }
  | { status: 'notfound' }
  | { status: 'ready'; group: Group }

export function useGroup(groupId: string): GroupState {
  const [state, setState] = useState<GroupState>({ status: 'loading' })

  useEffect(() => {
    return onSnapshot(
      doc(db, 'groups', groupId),
      (snap) => {
        setState(snap.exists() ? { status: 'ready', group: snap.data() as Group } : { status: 'notfound' })
      },
      () => setState({ status: 'notfound' }),
    )
  }, [groupId])

  return state
}
