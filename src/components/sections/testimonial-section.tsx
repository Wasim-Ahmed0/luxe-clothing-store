import { useRef, useEffect, useState, useCallback } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

/**
 * TestimonialSection Component
 *
 * Displays client testimonials with animation
 * with improved resize handling
 */

export default function TestimonialSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [isMobile, setIsMobile] = useState(false)
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null)

  // Detect mobile state
  const checkMobile = useCallback(() => {
    setIsMobile(window.innerWidth < 768)
  }, [])

  useEffect(() => {
    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [checkMobile])

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    if (!sectionRef.current) return

    // Function to set up the animation
    const setupAnimation = () => {
      // Kill previous ScrollTrigger instance if it exists
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill()
        scrollTriggerRef.current = null
      }

      // Reset opacity to ensure visibility
      gsap.set(sectionRef.current, { opacity: 1, scale: 1 })

      // Create animation
      scrollTriggerRef.current = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 95%",
        onEnter: () => {
          gsap.fromTo(
            sectionRef.current,
            { opacity: 0, scale: 0.95 },
            {
              opacity: 1,
              scale: 1,
              duration: 1,
              ease: "power2.out",
            },
          )
        },
        once: false, // Allow re-triggering on resize
      })

      // Force visibility if section is already in view
      const st = scrollTriggerRef.current
      if (st && st.progress > 0) {
        gsap.set(sectionRef.current, { opacity: 1, scale: 1 })
      }
    }

    // Initial setup
    setupAnimation()

    // Set up resize handler with debounce
    let resizeTimeout: NodeJS.Timeout
    const handleResize = () => {
      // Ensure section is visible during resize
      if (sectionRef.current) {
        gsap.set(sectionRef.current, { opacity: 1, scale: 1 })
      }

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
  }, [isMobile])

  return (
    <section
      ref={sectionRef}
      className="py-16 md:py-24 px-6 md:px-16 lg:px-24 bg-gradient-to-r from-amber-50 to-stone-100"
      style={{
        zIndex: 10,
        position: "relative",
      }}
      id="testimonial-section"
    >
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-light tracking-wider mb-2 text-stone-900">CLIENT TESTIMONIALS</h2>
        <div className="w-16 h-px bg-amber-800 mx-auto mb-16"></div>

        <blockquote className="text-xl md:text-2xl font-light italic text-stone-700 mb-8">
          "The attention to detail and quality of craftsmanship in every Luxe garment is unparalleled. Their bespoke
          service transformed my wardrobe completely."
        </blockquote>
        <p className="text-amber-800 font-medium">— James Richardson, London</p>
      </div>
    </section>
  )
}