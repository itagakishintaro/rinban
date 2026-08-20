import { expect, type Page } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

const { When, Then } = createBdd()

// featureの日本語ラベル → rotation type(selectのvalue)
const TYPE_BY_LABEL: Record<string, string> = {
  毎日: 'daily',
  毎週: 'weekly',
  毎月: 'monthlyNthWeekday',
  毎年: 'yearly',
  毎週平日: 'weekdays',
}

const WEEKDAYS_JA = ['日', '月', '火', '水', '木', '金', '土']

function todayWeekdayJa(): string {
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }))
  return WEEKDAYS_JA[now.getDay()]
}

const scheduleItems = (page: Page) =>
  page.getByRole('list', { name: '予定一覧' }).getByRole('listitem')

async function setRotation(page: Page, label: string) {
  await page.getByLabel('繰り返し').selectOption(TYPE_BY_LABEL[label])
  await page.getByRole('button', { name: '設定を保存' }).click()
}

When('ローテーションを {string} に設定する', async ({ page }, label: string) => {
  await setRotation(page, label)
})

When('ローテーションを {string} に変更する', async ({ page }, label: string) => {
  await page.getByRole('button', { name: 'ローテーションを変更' }).click()
  await setRotation(page, label)
})

Then('予定一覧に {int} 件の予定が表示される', async ({ page }, count: number) => {
  await expect(scheduleItems(page)).toHaveCount(count)
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

Then('予定はすべて開始日と同じ曜日である', async ({ page }) => {
  // 開始日のデフォルトは今日
  const weekday = `(${todayWeekdayJa()})`
  for (const item of await scheduleItems(page).all()) {
    await expect(item).toContainText(weekday)
  }
})

Then('予定に土日は含まれない', async ({ page }) => {
  for (const item of await scheduleItems(page).all()) {
    await expect(item).not.toContainText('(土)')
    await expect(item).not.toContainText('(日)')
  }
})
