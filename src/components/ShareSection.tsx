import { useRef, useState } from 'react'

// 調整さん方式: URLをそのまま見せて「コピーする」ボタンを置く
export default function ShareSection() {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const url = location.href

  async function onCopy() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="mt-6 rounded border border-gray-200 bg-gray-50 p-4">
      <h2 className="text-sm font-bold">この輪番のURL</h2>
      <p className="mt-1 text-sm text-gray-600">
        URLをコピーしてSlackなどでメンバーに共有してください。
      </p>
      <div className="mt-2 flex gap-2">
        <input
          aria-label="この輪番のURL"
          readOnly
          value={url}
          onFocus={(e) => e.target.select()}
          className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm"
        />
        <button
          onClick={onCopy}
          className="shrink-0 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white"
        >
          コピーする
        </button>
      </div>
      {copied && <p className="mt-1 text-sm text-green-700">コピーしました</p>}
    </section>
  )
}
