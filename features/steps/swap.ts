import { expect, type Page } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

const { When, Then } = createBdd()

const scheduleItem = (page: Page, nth: number) =>
  page.getByRole('list', { name: '予定一覧' }).getByRole('listitem').nth(nth - 1)

When('予定の {int} 番目の入れ替えを開始する', async ({ page }, nth: number) => {
  await scheduleItem(page, nth).getByRole('button', { name: '入れ替え', exact: true }).click()
})

When('入れ替え先として {int} 番目を選ぶ', async ({ page }, nth: number) => {
  await scheduleItem(page, nth).getByRole('button', { name: 'この回と入れ替え' }).click()
})

When('予定の {int} 番目の入れ替えを取り消す', async ({ page }, nth: number) => {
  await scheduleItem(page, nth).getByRole('button', { name: '取り消し' }).click()
})

Then('予定の {int} 番目の担当は {string} である', async ({ page }, nth: number, name: string) => {
  await expect(scheduleItem(page, nth)).toContainText(name)
})
