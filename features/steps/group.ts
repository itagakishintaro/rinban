import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

const { When, Then } = createBdd()

When('グループ名 {string} を入力して作成する', async ({ page }, name: string) => {
  await page.getByLabel('グループ名').fill(name)
  await page.getByRole('button', { name: '作成' }).click()
})

Then('グループページに遷移する', async ({ page }) => {
  await page.waitForURL(/\/g\/[A-Za-z0-9]+/)
})

Then('グループ名 {string} が表示される', async ({ page }, name: string) => {
  await expect(page.getByRole('heading', { name })).toBeVisible()
})

When('存在しないグループのURLを開く', async ({ page }) => {
  await page.goto('/g/no-such-group-id-000000')
})

Then('{string} と表示される', async ({ page }, text: string) => {
  await expect(page.getByText(text)).toBeVisible()
})
