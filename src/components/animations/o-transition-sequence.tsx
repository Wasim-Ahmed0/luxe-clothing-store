import { useRef, useEffect, useState, useCallback } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Image from "next/image"
import OCharacter from "../../../public/images/O Image.png";
import heritageImage from "../../../public/images/Heritage-asset.jpeg";
import colImage1 from "../../../public/images/suit collection.jpeg";
import colImage2 from "../../../public/images/watch collection.jpeg";
import colImage3 from "../../../public/images/shirt collection.jpeg";

/**
 * OTransitionSequence Component
 *
 * Handles the animation sequence with the "O" character transition
 * with improved resize handling
 */
export default function OTransitionSequence() {
  // Refs
  const containerRef = useRef<HTMLDivElement>(null)
  const heritageContainerRef = useRef<HTMLDivElement>(null)
  const heritageSectionRef = useRef<HTMLDivElement>(null)
  const collectionContainerRef = useRef<HTMLDivElement>(null)
  const oWrapperRef = useRef<HTMLDivElement>(null)
  const oImageRef = useRef<HTMLImageElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null)

  // State
  const [isMobile, setIsMobile] = useState(false)
  const [isLowPowerDevice, setIsLowPowerDevice] = useState(false)

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
    return () => window.removeEventListener("resize", detectDeviceCapabilities)
  }, [detectDeviceCapabilities])

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    // Function to set up the animation
    const setupAnimation = () => {
      if (
        !containerRef.current ||
        !oWrapperRef.current ||
        !oImageRef.current ||
        !viewportRef.current ||
        !heritageContainerRef.current ||
        !heritageSectionRef.current ||
        !collectionContainerRef.current
      )
        return

      // Kill previous ScrollTrigger instance if it exists
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill()
        scrollTriggerRef.current = null
      }

      // Performance optimization settings
      const scrubAmount = isLowPowerDevice ? 1.5 : 1
      const anticipatePin = isLowPowerDevice ? 0.5 : 1

      // Get the initial position of the O character
      const oRect = oWrapperRef.current.getBoundingClientRect()
      const initialX = oRect.left + oRect.width / 2
      const initialY = oRect.top + oRect.height / 2

      // Get the position of the heritage section
      const heritageRect = heritageSectionRef.current.getBoundingClientRect()
      const heritageCenterX = heritageRect.left + heritageRect.width / 2
      const heritageCenterY = heritageRect.top + heritageRect.height / 2

      // Calculate the distance to move
      const moveX = heritageCenterX - initialX
      const moveY = heritageCenterY - initialY

      // Set initial states
      gsap.set(viewportRef.current, {
        perspective: 1000,
        transformStyle: "preserve-3d",
        backfaceVisibility: "hidden",
      })

      gsap.set(collectionContainerRef.current, {
        opacity: 0,
        force3D: true,
      })

      // Find all heritage content elements
      const heritageContentElements = document.querySelectorAll(".heritage-content")

      // Optimize animated elements
      gsap.set([oWrapperRef.current, ...heritageContentElements], {
        willChange: "transform, opacity",
        force3D: true,
      })

      // Create the main timeline
      const tl = gsap.timeline({
        defaults: {
          ease: "power2.inOut",
          force3D: true,
        },
        onComplete: () => {
          if (collectionContainerRef.current) {
            gsap.set(collectionContainerRef.current, { opacity: 1 })
          }
        },
      })

      // Create ScrollTrigger
      scrollTriggerRef.current = ScrollTrigger.create({
        animation: tl,
        trigger: containerRef.current,
        start: "top top",
        end: isMobile ? "+=180%" : "+=200%",
        pin: true,
        scrub: scrubAmount,
        anticipatePin: anticipatePin,
        fastScrollEnd: true,
        preventOverlaps: true,
        pinReparent: isMobile,
        invalidateOnRefresh: true, // Important for resize handling
      })

      if (isMobile || isLowPowerDevice) {
        // MOBILE ANIMATION SEQUENCE
        tl.to({}, { duration: 0.1 }, 0)
          // Fade in heritage content
          .to(
            heritageContentElements,
            {
              opacity: 1,
              duration: 0.15,
              stagger: 0.05,
            },
            0,
          )
          // Scale the "O"
          .to(
            oWrapperRef.current,
            {
              x: moveX,
              y: moveY,
              scale: isLowPowerDevice ? 6 : 8,
              duration: 0.3,
            },
            0.15,
          )
          // Fade out heritage content
          .to(
            heritageContentElements,
            {
              opacity: 0,
              duration: 0.3,
            },
            0.15,
          )
          // Fade out the "O"
          .to(
            oWrapperRef.current,
            {
              opacity: 0,
              duration: 0.1,
              ease: "power1.in",
            },
            0.45,
          )
          // Fade in collection section
          .to(
            collectionContainerRef.current,
            {
              opacity: 1,
              duration: 0.45,
            },
            0.55,
          )
      } else {
        // DESKTOP ANIMATION SEQUENCE
        tl.to(
          oWrapperRef.current,
          {
            x: moveX,
            y: moveY,
            scale: 12,
            duration: 0.3,
          },
          0,
        )
          .to(
            heritageContentElements,
            {
              opacity: 0,
              duration: 0.3,
            },
            0,
          )
          .to(
            oWrapperRef.current,
            {
              scale: 12,
              duration: 0.1,
            },
            0.3,
          )
          .to(
            viewportRef.current,
            {
              scale: 2,
              z: 200,
              duration: 0.1,
              ease: "power2.in",
            },
            0.4,
          )
          .to(
            oWrapperRef.current,
            {
              scale: 30,
              duration: 0.1,
              ease: "power2.in",
            },
            0.4,
          )
          .to(
            oWrapperRef.current,
            {
              opacity: 0,
              duration: 0.02,
              ease: "power1.in",
            },
            0.5,
          )
          .to(
            viewportRef.current,
            {
              scale: 1,
              z: 0,
              duration: 0.03,
              ease: "none",
            },
            0.52,
          )
          .to(
            collectionContainerRef.current,
            {
              opacity: 1,
              duration: 0.45,
            },
            0.55,
          )
      }
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
  }, [isMobile, isLowPowerDevice]) // Only depend on these state values

  return (
    // <div ref={containerRef} className="relative h-[200vh]" style={{ overflow: 'hidden' }}></div>
    <div ref={containerRef} className="relative h-screen">
      {/* Viewport container */}
      <div
        ref={viewportRef}
        className="absolute top-0 left-0 w-full h-screen"
        style={{
          perspective: "1000px",
          transformStyle: "preserve-3d",
          transformOrigin: "center center",
          willChange: "transform",
          backfaceVisibility: "hidden",
        }}
      >
        {/* Heritage Section */}
        <div ref={heritageContainerRef} className="absolute top-0 left-0 w-full h-screen" style={{ zIndex: 5 }}>
          <div
            ref={heritageSectionRef}
            className={`h-full flex items-center ${isMobile ? "bg-gradient-to-b from-stone-100 to-stone-200" : "bg-stone-200"}`}
          >
            <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24 w-full">
              <div className="grid md:grid-cols-12 gap-6 md:gap-8 items-center">
                {/* Text content */}
                <div className="md:col-span-5 md:col-start-1">
                  <h2 className="text-3xl md:text-4xl font-light tracking-wider mb-3 text-stone-900 relative">
                    <span className="opacity-0">O</span>
                    <span className="heritage-content absolute top-0 left-0">
                      <span className="opacity-0">O</span>UR HERITAGE
                    </span>
                    {/* 'O' image */}
                    <div
                      ref={oWrapperRef}
                      className="absolute top-0 left-0 w-[0.8em] h-[0.8em]"
                      style={{
                        willChange: "transform, opacity",
                        transformOrigin: "center center",
                        position: "absolute",
                        zIndex: 50,
                        backfaceVisibility: "hidden",
                      }}
                    >
                      <Image
                        ref={oImageRef as any}
                        src={ OCharacter }
                        alt="O"
                        width={100}
                        height={100}
                        className="w-full h-full object-contain"
                        priority={true}
                      />
                    </div>
                  </h2>

                  {/* Heritage content */}
                  <div className="heritage-content">
                    <div className="w-16 h-0.5 bg-amber-700 mb-6"></div>

                    <div className="space-y-4">
                      <p className="text-stone-700 leading-relaxed">
                        Founded in 2010, Luxe has established itself as a beacon of refined menswear, combining
                        traditional craftsmanship with contemporary design. Each piece is meticulously crafted by master
                        artisans using only the finest materials sourced from around the world.
                      </p>
                      <p className="text-stone-700 leading-relaxed">
                        Our heritage is built on an unwavering dedication to quality and an appreciation for timeless
                        elegance. We believe that true luxury lies in the perfect balance of form and function, creating
                        garments that stand the test of time both in durability and style.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Image container */}
                <div className="md:col-span-7 md:col-start-6 heritage-content mt-4 md:mt-0">
                  <div
                    className={`relative ${isMobile ? "h-[350px]" : "h-[450px]"} md:h-[520px] overflow-hidden rounded-sm shadow-xl`}
                  >
                    <Image
                      src={ heritageImage }
                      alt="Luxe craftsmanship"
                      fill
                      className="object-cover object-center"
                      sizes="(max-width: 768px) 100vw, 60vw"
                      priority={true}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Collection Section */}
      <div
        ref={collectionContainerRef}
        className="absolute top-0 left-0 w-full min-h-screen"
        style={{
          zIndex: 10,
          willChange: "opacity",
          backfaceVisibility: "hidden",
          position: isMobile ? "relative" : "absolute",
        }}
      >
        <div
          className={`min-h-screen ${isMobile ? "bg-gradient-to-b from-stone-200 to-stone-100" : "bg-stone-200"} flex flex-col justify-start pt-24 md:pt-32`}
        >
          <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24 w-full pb-16">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-light tracking-wider mb-3 text-stone-900">
                FEATURED COLLECTION
              </h2>
              <div className="w-16 h-0.5 bg-amber-800 mx-auto mb-12"></div>
            </div>

            {/* Product grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Product 1 */}
              <div className="group">
                <div className="relative h-[300px] md:h-[450px] mb-4 overflow-hidden">
                  <Image
                    src={colImage1}
                    alt="Luxe suit collection"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    loading="eager"
                  />
                </div>
                <h3 className="text-lg font-light mb-1 text-stone-900">Summer Linen Suit</h3>
                <p className="text-amber-800">$1,895.00</p>
              </div>

              {/* Product 2 */}
              <div className="group">
                <div className="relative h-[300px] md:h-[450px] mb-4 overflow-hidden">
                  <Image
                    src={colImage2}
                    alt="Luxe watch collection"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <h3 className="text-lg font-light mb-1 text-stone-900">Signature Timepiece</h3>
                <p className="text-amber-800">$3,250.00</p>
              </div>

              {/* Product 3 */}
              <div className="group">
                <div className="relative h-[300px] md:h-[450px] mb-4 overflow-hidden">
                  <Image
                    src={colImage3}
                    alt="Luxe shirt collection"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <h3 className="text-lg font-light mb-1 text-stone-900">Premium Linen Shirt</h3>
                <p className="text-amber-800">$495.00</p>
              </div>
            </div>

            {/* Bottom padding */}
            <div className="h-16 md:h-8"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
