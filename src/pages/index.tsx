import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import IntroAnimation from "@/components/animations/intro-animation";
import AnimationSequenceController from "@/components/animations/animation-sequence-controller";
import TestimonialSection from "@/components/sections/testimonial-section";
import ScrollObserver from "@/components/animations/scroll-observer";

export default function Home() {
  const [introComplete, setIntroComplete] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const detectDeviceCapabilities = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      if (contentRef.current) {
        contentRef.current.style.marginTop = mobile ? "250vh" : "200vh";
      }
    };

    detectDeviceCapabilities();
    window.addEventListener("resize", detectDeviceCapabilities);
    
    return () => {
      window.removeEventListener("resize", detectDeviceCapabilities);
    };
  }, []);

  const handleIntroComplete = () => {
    setIntroComplete(true);
    
    setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 100);
  };

  if (!introComplete) {
    return <IntroAnimation onComplete={handleIntroComplete} />;
  }

  return (
    <ScrollObserver>
      <Head>
        <title>LUXE | Luxury Men's Clothing</title>
        <meta name="description" content="Discover the finest in men's luxury fashion at LUXE. Timeless elegance meets modern sophistication." />
      </Head>
      
      <main ref={mainRef} className="relative min-h-screen bg-stone-50 text-stone-900" style={{ overflowX: "hidden" }}>
        <Navbar />

        <div className="relative">
          <AnimationSequenceController />
        </div>

        <div
          ref={contentRef}
          className="relative"
          style={{
            marginTop: isMobile ? "250vh" : "200vh",
            position: "relative",
            zIndex: 10,
          }}
        >
          <TestimonialSection />
          <Footer />
        </div>
      </main>
    </ScrollObserver>
  );
}
