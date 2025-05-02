import { useState, useEffect, useRef } from "react"
import HeroSection from "@/components/animations/hero-section"
import OTransitionSequence from "@/components/animations/o-transition-sequence"

/**
 * AnimationSequenceController Component
 *
 * Orchestrates the main animation sequence for the homepage
 * with improved resize handling
 */
export default function AnimationSequenceController() {
  const [isMobile, setIsMobile] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Initial check
    checkMobile()

    // Add resize listener
    window.addEventListener("resize", checkMobile)

    // Clean up
    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  // Update container height dynamically when mobile state changes
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.height = isMobile ? "250vh" : "200vh"
    }
  }, [isMobile])

  return (
    <div
      ref={containerRef}
      className="relative transition-all duration-300 ease-out"
      style={{
        height: isMobile ? "250vh" : "200vh",
        position: "relative",
        zIndex: 20,
      }}
    >
      {/* Phase 1: Hero Section */}
      <HeroSection />

      {/* Phase 2-4: O Transition Sequence */}
      <div
        style={{
          position: "absolute",
          top: isMobile ? "120vh" : "100vh",
          left: 0,
          width: "100%",
          height: "100vh",
          zIndex: 5,
          transition: "top 0.3s ease-out", // Smooth transition for position changes
        }}
      >
        <OTransitionSequence />
      </div>
    </div>
  )
}
