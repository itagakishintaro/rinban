import { test, expect } from 'vitest'
import { validateGroupName } from './validation'

test('前後の空白を除いた名前を返す', () => {
  expect(validateGroupName('  朝会司会 ')).toBe('朝会司会')
})

test('空文字はnull', () => {
  expect(validateGroupName('')).toBeNull()
})

test('空白のみはnull', () => {
  expect(validateGroupName('   ')).toBeNull()
})

test('50文字は許容', () => {
  expect(validateGroupName('あ'.repeat(50))).toBe('あ'.repeat(50))
})

test('51文字はnull', () => {
  expect(validateGroupName('あ'.repeat(51))).toBeNull()
})
