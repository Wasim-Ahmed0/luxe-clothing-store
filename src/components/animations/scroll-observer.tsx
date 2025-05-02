import { type ReactNode, useEffect, useState, useCallback } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

/**
 * ScrollObserver Component
 *
 * Sets up global scroll animations and effects with improved resize handling
 */

export default function ScrollObserver({ children }: { children: ReactNode }) {
  const [isLowPowerDevice, setIsLowPowerDevice] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Detect device capabilities
  const detectDeviceCapabilities = useCallback(() => {
    const mobile = window.innerWidth < 768
    setIsMobile(mobile)

    const lowPower =
      mobile &&
      (navigator.hardwareConcurrency <= 4 || /Android [456]|iPhone OS [89]|iPhone OS 1[0-2]_/.test(navigator.userAgent))

    setIsLowPowerDevice(lowPower)
  }, [])

  useEffect(() => {
    detectDeviceCapabilities()
    window.addEventListener("resize", detectDeviceCapabilities)

    return () => {
      window.removeEventListener("resize", detectDeviceCapabilities)
    }
  }, [detectDeviceCapabilities])

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    // Set up global GSAP configurations
    gsap.config({
      autoSleep: 60,
      force3D: true,
      nullTargetWarn: false,
    })

    // Performance optimizations
    if (isLowPowerDevice) {
      gsap.ticker.fps(30)
    } else {
      gsap.ticker.fps(60)
    }

    // Mobile-specific configuration
    if (isMobile) {
      ScrollTrigger.config({
        ignoreMobileResize: false,
      })
    }

    // Improved resize handler with immediate refresh for better responsiveness
    const handleResize = () => {
      // Immediate partial refresh for smoother transitions
      ScrollTrigger.refresh(false)

      // Full refresh after resize completes
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        // Force a complete refresh of all ScrollTrigger instances
        ScrollTrigger.getAll().forEach((st) => {
          st.refresh()
        })

        // Then do a global refresh
        ScrollTrigger.refresh(true)
      }, 250)
    }

    let resizeTimeout: NodeJS.Timeout
    window.addEventListener("resize", handleResize)

    // Initial refresh
    ScrollTrigger.refresh()

    // Clean up
    return () => {
      window.removeEventListener("resize", handleResize)
      clearTimeout(resizeTimeout)
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
      gsap.globalTimeline.clear()
      gsap.ticker.fps(60)
    }
  }, [isLowPowerDevice, isMobile])

  return <>{children}</>
}
