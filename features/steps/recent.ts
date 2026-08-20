import { expect, type Page } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

const { When, Then } = createBdd()

const recentList = (page: Page) => page.getByRole('list', { name: '最近見た輪番' })

Then('最近見た輪番に {string} が表示される', async ({ page }, name: string) => {
  await expect(recentList(page).getByRole('link', { name })).toBeVisible()
})

When('最近見た輪番の {string} を開く', async ({ page }, name: string) => {
  await recentList(page).getByRole('link', { name }).click()
})
