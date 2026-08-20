import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

const { When, Then } = createBdd()

// Asia/Tokyoの今日からoffset日ずらしたYYYY-MM-DD
function dateFromToday(offsetDays: number): string {
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }))
  now.setDate(now.getDate() + offsetDays)
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

When('終了日を {int} 日後に設定する', async ({ page }, days: number) => {
  await page.getByLabel('終了日').fill(dateFromToday(days))
})

When('終了日を {int} 日前に設定する', async ({ page }, days: number) => {
  await page.getByLabel('終了日').fill(dateFromToday(-days))
})

When('輪番をアーカイブする', async ({ page }) => {
  await page.getByRole('button', { name: 'アーカイブする' }).click()
})

When('輪番を復元する', async ({ page }) => {
  await page.getByRole('button', { name: '復元する' }).click()
})

// localStorage(所有フラグ・訪問履歴)を消して別ブラウザの状態を再現する
When('別のブラウザとしてグループページを開き直す', async ({ page }) => {
  await page.evaluate(() => localStorage.clear())
  await page.reload()
})

Then('{string} ボタンは表示されない', async ({ page }, name: string) => {
  await expect(page.getByRole('button', { name })).toHaveCount(0)
})
