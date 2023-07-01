import { useState } from 'react'

export default function CopyLinkButton({ onCopy }: { onCopy: () => void }) {
  const [linkCopied, setLinkCopied] = useState(false)
  return (
    <button
      className="btn btn-primary"
      disabled={linkCopied}
      onClick={async () => {
        await navigator.clipboard.writeText(window.location.href)
        onCopy()
        setLinkCopied(true)
        setTimeout(() => setLinkCopied(false), 5000)
      }}
    >
      {linkCopied ? 'Copied! 📋' : 'Copy link 🔗'}
    </button>
  )
}
