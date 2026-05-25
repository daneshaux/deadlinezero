'use client'

import Lottie from 'lottie-react'
import animationData from '@/public/lottie/MoneyInvestment.json'

/**
 * Hero animation for the landing page desktop layout.
 * Sized and positioned by the parent — this component fills its container.
 * lottie-react requires 'use client' because it relies on browser canvas APIs.
 */
export function HeroLottie() {
  return (
    <Lottie
      animationData={animationData}
      loop
      autoplay
      className="w-full h-full"
    />
  )
}
