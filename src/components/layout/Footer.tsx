import Link from "next/link"

/**
 * Footer Component
 *
 * This component renders the site footer with:
 * - Brand logo
 * - Navigation links
 * - Copyright information
 *
 * The footer provides consistent branding and navigation options
 * at the bottom of every page.
 */


export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-stone-900 py-12 px-8 text-stone-200">
      <div className="max-w-7xl mx-auto text-center">
        <div className="mb-8">
          <Link href="/" className="text-2xl font-light tracking-widest text-white">
            LUXE
          </Link>
        </div>

        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-8">
          <Link href="/shop" className="text-sm tracking-wider text-stone-300 hover:text-amber-400 transition-colors">
            SHOP
          </Link>
          <Link
            href="/collections"
            className="text-sm tracking-wider text-stone-300 hover:text-amber-400 transition-colors"
          >
            COLLECTIONS
          </Link>
          <Link href="/about" className="text-sm tracking-wider text-stone-300 hover:text-amber-400 transition-colors">
            ABOUT
          </Link>
          <Link
            href="/contact"
            className="text-sm tracking-wider text-stone-300 hover:text-amber-400 transition-colors"
          >
            CONTACT
          </Link>
          <Link href="/terms" className="text-sm tracking-wider text-stone-300 hover:text-amber-400 transition-colors">
            TERMS
          </Link>
          <Link
            href="/privacy"
            className="text-sm tracking-wider text-stone-300 hover:text-amber-400 transition-colors"
          >
            PRIVACY
          </Link>
        </div>

        <div className="text-stone-400 text-sm">&copy; {currentYear} LUXE. All rights reserved.</div>
      </div>
    </footer>
  )
}
