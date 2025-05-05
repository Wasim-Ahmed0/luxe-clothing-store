import { useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ShoppingBag, Trash2, X, PersonStandingIcon } from "lucide-react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import CartDrawer from "@/components/cart/cart-drawer"
import { useWishlist } from "@/context/wishlist-context"
import { useCart } from "@/context/cart-context"
import productImages from "@/lib/product-images"

export default function WishlistPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { items, removeItem, loading: wishlistLoading } = useWishlist()
  const { addItem } = useCart()
  const [addingId, setAddingId] = useState<string | null>(null)

  // GBP formatting
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(price)

  const handleAddToCart = async (variantId: string) => {
    await addItem(variantId, 1)
    setAddingId(variantId)
    setTimeout(() => setAddingId(null), 3000)
  }

  const clearWishlist = useCallback(async () => {
    await Promise.all(items.map((i) => removeItem(i.variantId)))
  }, [items, removeItem])

  // Loading state
  if (status === "loading" || wishlistLoading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-stone-50 flex items-center justify-center">
          <p className="text-stone-500">Loading wishlist…</p>
        </main>
        <Footer />
      </>
    )
  }

  // Not signed in: prompt
  if (status !== "authenticated") {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-stone-50 flex flex-col items-center justify-center text-center px-4">
          <PersonStandingIcon size={64} className="text-stone-300 mb-4" />
          <h2 className="text-2xl font-light text-stone-900 mb-2">
            Please sign in to view your wishlist
          </h2>
          <p className="text-stone-500 mb-6">
            Sign in to save your favorite items and access them anytime.
          </p>
          <button
            onClick={() => router.push("/auth")}
            className="mt-4 px-6 py-3 bg-amber-800 text-white hover:bg-amber-700 transition-colors rounded"
          >
            Sign In
          </button>
        </main>
        <Footer />
      </>
    )
  }

  // Authenticated: original wishlist UI
  return (
    <>
      <Navbar />
      <CartDrawer />

      <main className="min-h-screen bg-stone-50 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8 border-b border-stone-200 pb-4">
            <h1 className="text-3xl font-light tracking-wider text-stone-900">MY WISHLIST</h1>
            {items.length > 0 && (
              <button
                onClick={clearWishlist}
                className="text-sm text-stone-500 hover:text-amber-800 transition-colors flex items-center"
              >
                <Trash2 size={16} className="mr-2" />
                Clear Wishlist
              </button>
            )}
          </div>

          {/* Empty state */}
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mb-4">
                <X size={24} className="text-stone-400" />
              </div>
              <h2 className="text-xl font-light text-stone-900 mb-2">Your wishlist is empty</h2>
              <p className="text-stone-500 mb-6">
                Items you add to your wishlist will appear here.
              </p>
              <Link
                href="/shop"
                className="px-8 py-3 bg-amber-800 text-white hover:bg-amber-700 transition-colors text-sm tracking-widest"
              >
                CONTINUE SHOPPING
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {items.map((item) => (
                <div key={item.wishlistItemId} className="border border-stone-200 bg-white p-4 relative">
                  {/* Remove button */}
                  <button
                    onClick={() => removeItem(item.variantId)}
                    className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center bg-white bg-opacity-80 rounded-full text-stone-500 hover:text-stone-700 transition-colors z-10 cursor-pointer"
                    aria-label="Remove from wishlist"
                  >
                    <X size={20} />
                  </button>

                  {/* Product image */}
                  <Link
                    href={`/product/${item.productId}`}
                    className="block relative aspect-[3/4] mb-4 overflow-hidden"
                  >
                    <Image
                      src={productImages[item.name]}
                      alt={item.name}
                      fill
                      className="object-cover transition-transform duration-700 hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </Link>

                  {/* Product details */}
                  <div>
                    <Link href={`/product/${item.productId}`} className="block">
                      <h3 className="text-lg font-light text-stone-900 hover:text-amber-800 transition-colors">
                        {item.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-stone-500 mb-2">
                      {item.color} / {item.size}
                    </p>
                    <p className="text-amber-800 mb-4">{formatPrice(item.price)}</p>

                    {/* Added to cart feedback */}
                    {addingId === item.variantId && (
                      <div className="mb-4 p-2 bg-green-50 text-green-800 border border-green-200 text-sm">
                        Added to cart successfully!
                      </div>
                    )}

                    {/* Add to cart button */}
                    <button
                      onClick={() => handleAddToCart(item.variantId)}
                      className="w-full py-2 bg-stone-900 text-white text-sm flex items-center justify-center cursor-pointer transition duration-200 ease-in-out hover:bg-stone-800 hover:shadow-lg transform hover:scale-105"
                    >
                      <ShoppingBag size={16} className="mr-2" />
                      ADD TO CART
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  )
}