import { readFileSync } from 'node:fs'
import { beforeAll, afterAll, beforeEach, test } from 'vitest'
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing'
import { doc, getDoc, getDocs, collection, setDoc, deleteDoc } from 'firebase/firestore'

let env: RulesTestEnvironment

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-rinban',
    firestore: { rules: readFileSync('firestore.rules', 'utf8') },
  })
})

afterAll(async () => {
  await env.cleanup()
})

beforeEach(async () => {
  await env.clearFirestore()
})

const validGroup = {
  name: '朝会司会',
  members: [],
  order: [],
  overrides: {},
}

function db() {
  return env.unauthenticatedContext().firestore()
}

async function seed(id: string) {
  await env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), 'groups', id), validGroup)
  })
}

test('getは誰でも可', async () => {
  await seed('g1')
  await assertSucceeds(getDoc(doc(db(), 'groups', 'g1')))
})

test('listは拒否', async () => {
  await seed('g1')
  await assertFails(getDocs(collection(db(), 'groups')))
})

test('正しいスキーマのcreateは可', async () => {
  await assertSucceeds(setDoc(doc(db(), 'groups', 'g1'), validGroup))
})

test('正しいスキーマのupdateは可', async () => {
  await seed('g1')
  await assertSucceeds(setDoc(doc(db(), 'groups', 'g1'), { ...validGroup, name: '読書会' }))
})

test('空の名前は拒否', async () => {
  await assertFails(setDoc(doc(db(), 'groups', 'g1'), { ...validGroup, name: '' }))
})

test('51文字の名前は拒否', async () => {
  await assertFails(setDoc(doc(db(), 'groups', 'g1'), { ...validGroup, name: 'あ'.repeat(51) }))
})

test('名前が文字列でなければ拒否', async () => {
  await assertFails(setDoc(doc(db(), 'groups', 'g1'), { ...validGroup, name: 123 }))
})

test('未定義フィールドがあれば拒否', async () => {
  await assertFails(setDoc(doc(db(), 'groups', 'g1'), { ...validGroup, hacked: true }))
})

test('メンバー51人は拒否', async () => {
  const members = Array.from({ length: 51 }, (_, i) => ({ id: `m${i}`, name: `メンバー${i}` }))
  await assertFails(setDoc(doc(db(), 'groups', 'g1'), { ...validGroup, members }))
})

test('endDateとarchivedは正しい型なら可', async () => {
  await assertSucceeds(
    setDoc(doc(db(), 'groups', 'g1'), { ...validGroup, endDate: '2026-12-31', archived: true }),
  )
})

test('endDateが文字列でなければ拒否', async () => {
  await assertFails(setDoc(doc(db(), 'groups', 'g1'), { ...validGroup, endDate: 20261231 }))
})

test('deleteは拒否', async () => {
  await seed('g1')
  await assertFails(deleteDoc(doc(db(), 'groups', 'g1')))
})
