import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

const { When, Then } = createBdd()

Then('この輪番のURLが表示されている', async ({ page }) => {
  await expect(page.getByLabel('この輪番のURL')).toHaveValue(page.url())
})

When('コピーするボタンを押す', async ({ page }) => {
  await page.getByRole('button', { name: 'コピーする' }).click()
})

Then('クリップボードに現在のURLが入っている', async ({ page }) => {
  const copied = await page.evaluate(() => navigator.clipboard.readText())
  expect(copied).toBe(page.url())
})
