import { expect, type Page } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

const { When, Then } = createBdd()

const dialog = (page: Page) => page.getByRole('dialog', { name: 'カスタムの繰り返し' })

When('カスタムの繰り返しを開く', async ({ page }) => {
  await page.getByLabel('繰り返し').selectOption('custom')
  await expect(dialog(page)).toBeVisible()
})

When('繰り返す間隔を {int} {string} にする', async ({ page }, interval: number, unit: string) => {
  await dialog(page).getByLabel('繰り返す間隔').fill(String(interval))
  await dialog(page).getByLabel('単位').selectOption({ label: unit })
})

When('曜日を {string} と {string} だけにする', async ({ page }, a: string, b: string) => {
  const want = new Set([a, b])
  for (const wd of ['月', '火', '水', '木', '金', '土', '日']) {
    const pill = dialog(page).getByRole('button', { name: wd, exact: true })
    const pressed = (await pill.getAttribute('aria-pressed')) === 'true'
    if (pressed !== want.has(wd)) await pill.click()
  }
})

When('終了を {int} 回にする', async ({ page }, count: number) => {
  await dialog(page).getByRole('radio', { name: '回数' }).check()
  await dialog(page).getByLabel('繰り返す回数').fill(String(count))
})

When('カスタムを完了する', async ({ page }) => {
  await dialog(page).getByRole('button', { name: '完了' }).click()
})

Then('予定はすべて {string} または {string} である', async ({ page }, a: string, b: string) => {
  const items = page.getByRole('list', { name: '予定一覧' }).getByRole('listitem')
  for (const item of await items.all()) {
    const text = (await item.textContent()) ?? ''
    expect(text.includes(a) || text.includes(b)).toBe(true)
  }
})
