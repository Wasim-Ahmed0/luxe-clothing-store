import { useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/router"
import { X, Minus, Plus, ShoppingBag } from "lucide-react"
import { useCart } from "@/context/cart-context"
import productImages from "@/lib/product-images"

export default function CartDrawer() {
  const {
    items,
    isCartOpen,
    closeCart,
    removeItem,
    updateQuantity,
    cartTotal,
    cartCount,
  } = useCart()
  const drawerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { data: session, status } = useSession()
  const isAuthenticated = status === 'authenticated'

  // Lock scroll when open
  useEffect(() => {
    document.body.style.overflow = isCartOpen ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [isCartOpen])

  if (!isCartOpen) return null

  const fmt = (v: number) =>
    new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(v)

  const getCartId = (): string | null => {
    if (typeof document === "undefined") return null
    const m = document.cookie.match(/(?:^|;\s*)cart_id=([^;]+)/)
    return m?.[1] ?? null
  }

  // Just navigate to /checkout with cart_id; actual order creation
  // will happen on the Payment step.
  const handleCheckout = () => {
    const cart_id = getCartId()
    if (!cart_id) {
      alert("No cart found.")
      return
    }

    closeCart()

    if (isAuthenticated) {
      router.push({
        pathname: "/checkout",
        query: { cart_id },
      });
    } else {
      router.push("/auth");
    }
  }
  
  return (
    <div className="fixed inset-0 z-50 block">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={closeCart}
      />

      {/* drawer */}
      <div
        ref={drawerRef}
        onClick={(e) => e.stopPropagation()}
        className="absolute top-0 right-0 h-full w-full max-w-md bg-white shadow-xl transform translate-x-0 transition-transform duration-300 ease-in-out"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-stone-200">
            <h2 className="text-xl font-light text-stone-900 flex items-center">
              <ShoppingBag size={20} className="mr-2" />
              Your Cart {cartCount > 0 && `(${cartCount})`}
            </h2>
            <button
              onClick={closeCart}
              className="text-stone-500 hover:text-stone-700 cursor-pointer"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingBag size={64} className="text-stone-300 mb-4" />
                <p className="text-stone-600 mb-6">Your cart is empty</p>
                <Link
                  href="/shop"
                  onClick={closeCart}
                  className="px-6 py-2 bg-amber-800 text-white hover:bg-amber-700 rounded cursor-pointer"
                >
                  Continue Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {items.map((item) => (
                  <div key={item.id} className="flex border-b border-stone-200 pb-6">
                    {/* Image */}
                    <div className="w-20 h-24 bg-stone-100 relative flex-shrink-0">
                      <Image
                        src={productImages[item.name]}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>

                    {/* Details */}
                    <div className="ml-4 flex-1">
                      <div className="flex justify-between">
                        <h3 className="text-sm font-medium text-stone-900">
                          {item.name}
                        </h3>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-stone-400 hover:text-stone-600 cursor-pointer"
                          aria-label="Remove item"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <p className="text-xs text-stone-900 mt-1">
                        Size: {item.size}
                        {item.color && item.color !== "Default"
                          ? ` • ${item.color}`
                          : ""}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center border border-stone-300">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="px-2 py-1 text-stone-400 hover:text-stone-900"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="px-2 text-sm text-stone-900">{item.quantity}</span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="px-2 py-1 text-stone-400 hover:text-stone-900"
                            aria-label="Increase quantity"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <p className="text-amber-800 font-medium">
                          {fmt(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-6 border-t border-stone-200 space-y-4">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span className="font-medium text-stone-900">{fmt(cartTotal)}</span>
              </div>
              <p className="text-xs text-stone-500">
                Shipping and taxes calculated at checkout
              </p>
              <button
                onClick={handleCheckout}
                className="w-full py-3 bg-amber-800 text-white hover:bg-amber-700 rounded transition-colors cursor-pointer"
              >
                CHECKOUT
              </button>
              <button
                onClick={closeCart}
                className="w-full py-3 border border-stone-300 text-stone-700 hover:bg-stone-200 rounded transition-colors cursor-pointer"
              >
                CONTINUE SHOPPING
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
