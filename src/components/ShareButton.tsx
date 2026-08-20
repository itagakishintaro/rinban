import { useRef, useState } from 'react'

export default function ShareButton({ groupName }: { groupName: string }) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  async function onShare() {
    const url = location.href
    // OSの共有シートはタッチデバイスのみ。デスクトップにもnavigator.shareが存在するため
    // これで分岐しないと、PCでコピーされず共有シートだけが開いてしまう
    if (navigator.share && matchMedia('(pointer: coarse)').matches) {
      try {
        await navigator.share({ title: `Rinban - ${groupName}`, url })
        return
      } catch {
        return
      }
    }
    await navigator.clipboard.writeText(url)
    setCopied(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), 2000)
  }

  return (
    <span className="flex items-center gap-2">
      {copied && <span className="text-sm text-green-700">URLをコピーしました</span>}
      <button
        onClick={onShare}
        className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white"
      >
        共有
      </button>
    </span>
  )
}
