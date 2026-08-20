import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

const { When, Then } = createBdd()

When('メンバー {string} を上に移動する', async ({ page }, name: string) => {
  await page.getByRole('button', { name: `${name}を上に移動` }).click()
})

When('メンバー {string} を下に移動する', async ({ page }, name: string) => {
  await page.getByRole('button', { name: `${name}を下に移動` }).click()
})

Then('メンバー一覧の {int} 番目は {string} である', async ({ page }, nth: number, name: string) => {
  const items = page.getByRole('list', { name: 'メンバー一覧' }).getByRole('listitem')
  await expect(items.nth(nth - 1)).toContainText(name)
})
