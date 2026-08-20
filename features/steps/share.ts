import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

const { When, Then } = createBdd()

When('共有ボタンを押す', async ({ page }) => {
  await page.getByRole('button', { name: '共有' }).click()
})

Then('クリップボードに現在のURLが入っている', async ({ page }) => {
  const copied = await page.evaluate(() => navigator.clipboard.readText())
  expect(copied).toBe(page.url())
})
