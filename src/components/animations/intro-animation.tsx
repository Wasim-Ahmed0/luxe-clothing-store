import { useEffect, useRef } from "react"
import { gsap } from "gsap"

/**
 * IntroAnimation Component
 *
 * Displays an animated intro sequence when the website first loads
 */

export default function IntroAnimation({ onComplete }: { onComplete: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        setTimeout(onComplete, 300)
      },
    })

    // Animation sequence
    tl.fromTo(
      logoRef.current,
      { opacity: 0, scale: 0.8 },
      {
        opacity: 1,
        scale: 1,
        duration: 1.5,
        ease: "power3.out",
      },
    )
      .to(logoRef.current, {
        opacity: 0,
        duration: 0.8,
        delay: 0.5,
        ease: "power2.in",
      })
      .to(
        containerRef.current,
        {
          opacity: 0,
          duration: 0.5,
          ease: "power2.in",
        },
        "-=0.3",
      )

    return () => {
      tl.kill()
    }
  }, [onComplete])

  return (
    <div ref={containerRef} className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div ref={logoRef} className="text-center">
        <h1 className="text-5xl md:text-7xl font-light tracking-[0.3em] text-white mb-4">LUXE</h1>
        <div className="w-16 h-px bg-amber-700 mx-auto"></div>
      </div>
    </div>
  )
}
