import { useEffect, useRef, useState, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import heroImage from "../../../public/images/headless-asset.webp";

/**
 * HeroSection Component
 *
 * Handles the first phase of the homepage animation sequence
 * with improved resize handling
 */

export default function HeroSection() {
  // Refs
  const sectionRef = useRef<HTMLElement>(null)
  const leftRef = useRef<HTMLDivElement>(null)
  const rightRef = useRef<HTMLDivElement>(null)
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null)

  // State
  const [isLowPowerDevice, setIsLowPowerDevice] = useState(false)

  // Detect device capabilities
  const detectDeviceCapabilities = useCallback(() => {
    const mobile = window.innerWidth < 768
    const lowPower =
      mobile &&
      (navigator.hardwareConcurrency <= 4 || /Android [456]|iPhone OS [89]|iPhone OS 1[0-2]_/.test(navigator.userAgent))

    setIsLowPowerDevice(lowPower)
  }, [])

  useEffect(() => {
    detectDeviceCapabilities()
    window.addEventListener("resize", detectDeviceCapabilities)
    return () => window.removeEventListener("resize", detectDeviceCapabilities)
  }, [detectDeviceCapabilities])

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    // Function to set up the animation
    const setupAnimation = () => {
      if (!sectionRef.current || !leftRef.current || !rightRef.current) return

      // Kill previous ScrollTrigger instance if it exists
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill()
        scrollTriggerRef.current = null
      }

      // Performance optimization
      const scrubAmount = isLowPowerDevice ? 1.5 : 1
      const anticipatePin = isLowPowerDevice ? 0.5 : 1

      // Optimize elements for animation
      gsap.set([leftRef.current, rightRef.current], {
        willChange: "transform",
        force3D: true,
        backfaceVisibility: "hidden",
      })

      // Create animation timeline
      const tl = gsap.timeline({
        defaults: {
          ease: "power2.inOut",
          force3D: true,
        },
      })

      // Animation: sides slide outward
      tl.to(
        leftRef.current,
        {
          xPercent: -100,
          duration: 1,
        },
        0,
      ).to(
        rightRef.current,
        {
          xPercent: 100,
          duration: 1,
        },
        0,
      )

      // Create ScrollTrigger
      scrollTriggerRef.current = ScrollTrigger.create({
        animation: tl,
        trigger: sectionRef.current,
        start: "top top",
        end: "bottom top",
        pin: true,
        scrub: scrubAmount,
        pinSpacing: true,
        anticipatePin: anticipatePin,
        fastScrollEnd: true,
        invalidateOnRefresh: true, // Important for resize handling
      })
    }

    // Initial setup
    setupAnimation()

    // Set up resize handler with debounce
    let resizeTimeout: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        setupAnimation()
      }, 250)
    }

    window.addEventListener("resize", handleResize)

    // Clean up
    return () => {
      window.removeEventListener("resize", handleResize)
      clearTimeout(resizeTimeout)
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill()
      }
    }
  }, [isLowPowerDevice]) // Only depend on isLowPowerDevice, not on the ScrollTrigger instance

  return (
    <section
      ref={sectionRef}
      className="panel"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        zIndex: 30,
      }}
      id="hero-section"
    >
      <div className="flex flex-col md:flex-row h-full">
        {/* Left content area */}
        <div
          ref={leftRef}
          className="w-full md:w-1/2 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-16 bg-gradient-to-r from-amber-50 to-stone-100"
          style={{
            position: "relative",
            willChange: "transform",
            backfaceVisibility: "hidden",
          }}
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-wider mb-6 text-stone-900">
            REFINED <br />
            <span className="font-medium">ELEGANCE</span>
          </h1>
          <p className="text-stone-600 text-lg md:text-xl mb-8 max-w-md">
            Crafting the finest menswear with uncompromising attention to detail and timeless sophistication.
          </p>
          <div>
            <Link
              href="/collection"
              className="inline-block px-8 py-3 bg-amber-800 text-white hover:bg-amber-700 transition-all duration-300 text-sm tracking-widest relative overflow-hidden group"
            >
              <span className="relative z-10">DISCOVER</span>
              <span className="absolute inset-0 bg-amber-700 transform scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100"></span>
            </Link>
          </div>
        </div>

        {/* Right image area */}
        <div
          ref={rightRef}
          className="w-full md:w-1/2 h-[50vh] md:h-full relative"
          style={{
            position: "relative",
            willChange: "transform",
            backfaceVisibility: "hidden",
          }}
        >
          <Image
            src={ heroImage }
            alt="Luxe menswear model"
            fill
            priority
            className="object-cover object-center"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      </div>
    </section>
  )
}
