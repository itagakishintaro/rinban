import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

const { When, Then } = createBdd()

When('トップページを開く', async ({ page }) => {
  await page.goto('/')
})

Then('アプリ名「Rinban」が表示される', async ({ page }) => {
  await expect(page.getByRole('banner').getByRole('link', { name: 'Rinban' })).toBeVisible()
})
