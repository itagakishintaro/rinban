import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

const { When, Then } = createBdd()

const scheduleItems = (page: import('@playwright/test').Page) =>
  page.getByRole('list', { name: '予定一覧' }).getByRole('listitem')

When('ローテーションを毎週 {string} に設定する', async ({ page }, weekday: string) => {
  await page.getByLabel('周期').selectOption({ label: '毎週' })
  await page.getByLabel('曜日').selectOption({ label: weekday })
  await page.getByRole('button', { name: '設定を保存' }).click()
})

When('ローテーションを毎月 {string} に変更する', async ({ page }, day: string) => {
  await page.getByRole('button', { name: 'ローテーションを変更' }).click()
  await page.getByLabel('周期').selectOption({ label: '毎月' })
  await page.getByLabel('日にち').selectOption({ label: day })
  await page.getByRole('button', { name: '設定を保存' }).click()
})

Then('予定一覧に {int} 件の予定が表示される', async ({ page }, count: number) => {
  await expect(scheduleItems(page)).toHaveCount(count)
})

Then('予定はすべて {string} を含む', async ({ page }, text: string) => {
  const items = scheduleItems(page)
  for (const item of await items.all()) {
    await expect(item).toContainText(text)
  }
})

Then(
  '予定の担当は {string} と {string} が交互である',
  async ({ page }, first: string, second: string) => {
    const items = scheduleItems(page)
    for (const [i, item] of (await items.all()).entries()) {
      await expect(item).toContainText(i % 2 === 0 ? first : second)
    }
  },
)

Then('予定の先頭に {string} と表示される', async ({ page }, text: string) => {
  await expect(scheduleItems(page).first()).toContainText(text)
})
