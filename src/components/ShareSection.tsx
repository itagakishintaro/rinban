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
    <section className="mt-6 rounded-2xl bg-white p-5 shadow-(--shadow-yuru-sm)">
      <h2 className="font-maru text-sm font-bold text-wakaba">この輪番のURL</h2>
      <p className="mt-1 text-sm text-soft">
        URLをコピーしてSlackなどでメンバーに共有してください。
      </p>
      <div className="mt-2 flex gap-2">
        <input
          aria-label="この輪番のURL"
          readOnly
          value={url}
          onFocus={(e) => e.target.select()}
          className="w-full rounded-xl border-2 border-cream-line px-3 py-2 text-sm text-soft"
        />
        <button
          onClick={onCopy}
          className="shrink-0 rounded-full bg-wakaba-soft px-4 py-2 text-sm font-bold text-wakaba"
        >
          コピーする
        </button>
      </div>
      {copied && <p className="mt-1 text-sm text-wakaba">コピーしました</p>}
    </section>
  )
}
