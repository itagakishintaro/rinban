import { test, expect } from 'vitest'
import { validateName } from './validation'

test('前後の空白を除いた名前を返す', () => {
  expect(validateName('  朝会司会 ')).toBe('朝会司会')
})

test('空文字はnull', () => {
  expect(validateName('')).toBeNull()
})

test('空白のみはnull', () => {
  expect(validateName('   ')).toBeNull()
})

test('50文字は許容', () => {
  expect(validateName('あ'.repeat(50))).toBe('あ'.repeat(50))
})

test('51文字はnull', () => {
  expect(validateName('あ'.repeat(51))).toBeNull()
})
