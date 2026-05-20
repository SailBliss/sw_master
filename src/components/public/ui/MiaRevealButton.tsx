'use client'

import { useEffect, useState } from 'react'
import { SparkleIcon } from '@components/icons/ui'

type MiaRevealButtonProps = {
  className?: string
  onClick?: () => void
}

export function MiaRevealButton({ className, onClick }: MiaRevealButtonProps) {
  const [isIntroOpen, setIsIntroOpen] = useState(false)

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduceMotion) {
      return
    }

    const openTimer = window.setTimeout(() => setIsIntroOpen(true), 240)
    const closeTimer = window.setTimeout(() => setIsIntroOpen(false), 2100)

    return () => {
      window.clearTimeout(openTimer)
      window.clearTimeout(closeTimer)
    }
  }, [])

  return (
    <button
      type="button"
      className={[
        'sw-mia-reveal-button',
        isIntroOpen ? 'sw-mia-reveal-button--intro-open' : undefined,
        className,
      ].filter(Boolean).join(' ')}
      aria-label="Pregúntale a MIA"
      onClick={onClick}
    >
      <span className="sw-mia-reveal-icon" aria-hidden="true">
        <SparkleIcon size={18} />
      </span>
      <span className="sw-mia-reveal-label" aria-hidden="true">
        Pregúntale a MIA
      </span>
    </button>
  )
}
