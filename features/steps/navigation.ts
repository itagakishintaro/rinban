import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

const { When, Then } = createBdd()

When('ヘッダーのタイトルをクリックする', async ({ page }) => {
  await page.getByRole('banner').getByRole('link', { name: 'Rinban' }).click()
})

Then('トップページに戻る', async ({ page }) => {
  await expect(page).toHaveURL('/')
})
