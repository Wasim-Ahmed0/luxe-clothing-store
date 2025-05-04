import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useCart } from "@/context/cart-context"
import { useWishlist } from "@/context/wishlist-context"
import { Menu, X, ShoppingBag, User, Heart, DoorOpen } from "lucide-react";

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
 * - Action icons (search, account, cart, fitting room cart)
 * - Mobile menu toggle
 */
export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { cartCount, toggleCart } = useCart()
  const { wishlistCount } = useWishlist()

  const [showFittingRoomCart, setShowFittingRoomCart] = useState(false)
  const defaultStore = process.env.NEXT_PUBLIC_DEFAULT_STORE_ID!

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const getCookie = (name: string) => {
      const match = document.cookie.match(
        new RegExp('(^|; )' + name.replace(/([.*+?^=!:${}()|[\]\\\/])/g, '\\$1') + '=([^;]*)')
      )
      return match ? decodeURIComponent(match[2]) : undefined
    }
    const storeIdCookie = getCookie("store_id")
    setShowFittingRoomCart(!!storeIdCookie && storeIdCookie !== defaultStore)
  }, [defaultStore])

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-6 transition-all duration-300 ${
          isScrolled ? "bg-white/90 backdrop-blur-sm shadow-sm" : "bg-transparent"
        }`}
      >
        <div className="flex items-center justify-between">
          <button className="md:hidden text-stone-900" onClick={() => setIsMenuOpen(true)} aria-label="Open menu">
            <Menu size={24} />
          </button>

          <Link href="/" className="text-2xl font-light tracking-widest text-stone-900">
            LUXE
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <NavItem href="/shop" label="SHOP" />
            <NavItem href="/" label="ABOUT" />
            <NavItem href="/" label="CONTACT" />
          </div>

          <div className="flex items-center space-x-5">
            {showFittingRoomCart && (
              <NavIcon
                icon={<DoorOpen size={20} strokeWidth={2} />}
                label="Fitting Room Cart"
                onClick={() => (window.location.href = "/fitting-room-cart")}
              />
            )}
            <NavIcon 
              icon={<User size={20} strokeWidth={2} />} 
              label="Account" 
              onClick={() => (window.location.href = "/account")}
            />
            <NavIcon
              icon={<Heart size={20} strokeWidth={2} />}
              label="Wishlist"
              badge={wishlistCount}
              showBadge={true}
              onClick={() => (window.location.href = "/wishlist")}
            />
            <NavIcon
              icon={<ShoppingBag size={20} strokeWidth={2} />}
              label="Cart"
              badge={cartCount}
              onClick={toggleCart}
              showBadge={true}
            />
          </div>
        </div>
      </nav>

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
          <Link href="/" className="text-2xl tracking-wider text-stone-900" onClick={() => setIsMenuOpen(false)}>
            ABOUT
          </Link>
          <Link href="/" className="text-2xl tracking-wider text-stone-900" onClick={() => setIsMenuOpen(false)}>
            CONTACT
          </Link>
          <Link
            href="/wishlist"
            className="text-2xl tracking-wider text-stone-900"
            onClick={() => setIsMenuOpen(false)}
          >
            WISHLIST
          </Link>
        </div>
      </div>
    </>
  )
}

function NavItem({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="text-sm tracking-wider text-amber-700 font-medium hover:text-amber-800 relative group transition-colors cursor-pointer"
    >
      {label}
      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-800 transition-all duration-300 group-hover:w-full"></span>
    </Link>
  )
}

function NavIcon({
  icon,
  label,
  badge,
  onClick,
  showBadge = false,
}: {
  icon: React.ReactNode
  label: string
  badge?: number
  onClick?: () => void
  showBadge?: boolean
}) {
  return (
    <button
      aria-label={label}
      className="text-amber-700 hover:text-amber-800 transition-colors relative group cursor-pointer"
      onClick={onClick}
    >
      {icon}
      {showBadge && badge !== undefined && badge > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-800 rounded-full text-white text-[10px] flex items-center justify-center">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </button>
  )
}
