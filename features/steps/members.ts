import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

const { When, Then } = createBdd()

const memberList = (page: import('@playwright/test').Page) =>
  page.getByRole('list', { name: 'メンバー一覧' })

When('メンバー {string} を追加する', async ({ page }, name: string) => {
  await page.getByLabel('メンバー名').fill(name)
  await page.getByRole('button', { name: '追加' }).click()
  await expect(memberList(page).getByText(name, { exact: true })).toBeVisible()
})

When(
  'メンバー {string} の名前を {string} に変更する',
  async ({ page }, from: string, to: string) => {
    await page.getByRole('button', { name: `${from}を変更` }).click()
    await page.getByLabel('新しいメンバー名').fill(to)
    await page.getByRole('button', { name: '保存', exact: true }).click()
  },
)

When('メンバー {string} を削除する', async ({ page }, name: string) => {
  await page.getByRole('button', { name: `${name}を削除` }).click()
})

Then('メンバー一覧に {string} が表示される', async ({ page }, name: string) => {
  await expect(memberList(page).getByText(name, { exact: true })).toBeVisible()
})

Then('メンバー一覧に {string} は表示されない', async ({ page }, name: string) => {
  await expect(memberList(page).getByText(name, { exact: true })).toHaveCount(0)
})
