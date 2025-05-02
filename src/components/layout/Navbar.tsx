import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X, ShoppingBag, User, Search } from "lucide-react";

/**
 * Navbar Component
 *
 * This component provides the main navigation for the website with responsive behavior:
 * - Transparent background when at the top of the page
 * - White background with shadow when scrolled
 * - Mobile menu for smaller screens
 * - Visual indicators for hover states
 *
 * The navbar includes:
 * - Brand logo
 * - Main navigation links
 * - Action icons (search, account, cart)
 * - Mobile menu toggle
 */
export default function Navbar() {
  // State to control mobile menu visibility
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // State to track scroll position for navbar styling
  const [isScrolled, setIsScrolled] = useState(false)

  // Effect to handle scroll events and update navbar appearance
  useEffect(() => {
    const handleScroll = () => {
      // Apply scrolled styles after scrolling 10px down
      if (window.scrollY > 10) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll)

    // Clean up event listener on component unmount
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      {/* Main Navigation Bar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-6 transition-all duration-300 ${
          isScrolled ? "bg-white/90 backdrop-blur-sm shadow-sm" : "bg-transparent"
        }`}
      >
        <div className="flex items-center justify-between">
          {/* Mobile menu button - only visible on small screens */}
          <button className="md:hidden text-stone-900" onClick={() => setIsMenuOpen(true)} aria-label="Open menu">
            <Menu size={24} />
          </button>

          {/* Brand Logo */}
          <Link href="/" className="text-2xl font-light tracking-widest text-stone-900">
            LUXE
          </Link>

          {/* Desktop Navigation Links - hidden on mobile */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Navigation Items with hover effects */}
            <NavItem href="/shop" label="SHOP" />
            <NavItem href="/collections" label="COLLECTIONS" />
            <NavItem href="/about" label="ABOUT" />
            <NavItem href="/contact" label="CONTACT" />
          </div>

          {/* Action Icons */}
          <div className="flex items-center space-x-5">
            <NavIcon icon={<Search size={20} strokeWidth={2} />} label="Search" />
            <NavIcon icon={<User size={20} strokeWidth={2} />} label="Account" />
            <NavIcon icon={<ShoppingBag size={20} strokeWidth={2} />} label="Cart" badge={0} />
          </div>
        </div>
      </nav>

      {/* Mobile Menu - slides in from left */}
      <div
        className={`fixed inset-0 bg-white z-50 transform transition-transform duration-300 ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-end p-6">
          <button onClick={() => setIsMenuOpen(false)} aria-label="Close menu" className="text-stone-900">
            <X size={24} />
          </button>
        </div>
        <div className="flex flex-col items-center justify-center h-full space-y-8">
          <Link href="/shop" className="text-2xl tracking-wider text-stone-900" onClick={() => setIsMenuOpen(false)}>
            SHOP
          </Link>
          <Link
            href="/collections"
            className="text-2xl tracking-wider text-stone-900"
            onClick={() => setIsMenuOpen(false)}
          >
            COLLECTIONS
          </Link>
          <Link href="/about" className="text-2xl tracking-wider text-stone-900" onClick={() => setIsMenuOpen(false)}>
            ABOUT
          </Link>
          <Link href="/contact" className="text-2xl tracking-wider text-stone-900" onClick={() => setIsMenuOpen(false)}>
            CONTACT
          </Link>
        </div>
      </div>
    </>
  )
}

/**
 * NavItem Component
 *
 * Renders a navigation link with consistent styling and hover effects
 */
function NavItem({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="text-sm tracking-wider text-amber-700 font-medium hover:text-amber-800 relative group transition-colors"
    >
      {label}
      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-800 transition-all duration-300 group-hover:w-full"></span>
    </Link>
  )
}

/**
 * NavIcon Component
 *
 * Renders an icon button with consistent styling and optional badge
 */
function NavIcon({
  icon,
  label,
  badge,
}: {
  icon: React.ReactNode
  label: string
  badge?: number
}) {
  return (
    <button aria-label={label} className="text-amber-700 hover:text-amber-800 transition-colors relative group">
      {icon}
      {badge !== undefined && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-800 rounded-full text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          {badge}
        </span>
      )}
    </button>
  )
}
