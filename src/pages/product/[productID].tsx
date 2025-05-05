import { useState, useEffect } from "react"
import Head from "next/head"
import Image from "next/image"
import Link from "next/link"
import { GetServerSideProps } from "next"
import { Heart, Truck } from "lucide-react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import CartDrawer from "@/components/cart/cart-drawer"
import { useCart } from "@/context/cart-context"
import { useWishlist } from "@/context/wishlist-context"
import productImages from "@/lib/product-images"
import { useFittingCart } from '@/context/fitting-cart-context'
import { useRouter } from "next/router"
import { prisma } from "../../../lib/prisma"

interface Variant {
  variant_id: string
  size:       string
  color:      string
  in_stock:   boolean
}

interface Product {
  product_id:  string
  name:        string
  description: string
  price:       number
  category:    string
  variants:    Variant[]
}

interface ProductDetailProps {
  product: Product
}


export default function ProductDetail({ product }: ProductDetailProps) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)
  const router = useRouter()

  // helper to read a store_id cookie
  const getCookie = (name: string): string | undefined => {
    if (typeof document === 'undefined') return undefined
    const m = document.cookie.match(new RegExp('(^|; )' + name + '=([^;]*)'))
    return m ? decodeURIComponent(m[2]) : undefined
  }

  const { addRequest } = useFittingCart()
  const [inStore, setInStore] = useState(false)
  const defaultStore = process.env.NEXT_PUBLIC_DEFAULT_STORE_ID!

  useEffect(() => {
    if (!router.isReady) return
    const raw = router.query.store_id
    const queryStoreId = Array.isArray(raw) ? raw[0] : raw
    const cookieStoreId = !queryStoreId ? getCookie('store_id') : undefined
    const storeId = queryStoreId ?? cookieStoreId
    setInStore(!!storeId && storeId !== defaultStore)
  }, [router.isReady, router.query.store_id])

  const { addItem } = useCart()
  const { isInWishlist, toggleItem, loading: wLoading } = useWishlist()

  const colors   = Array.from(new Set(product.variants.map(v => v.color)))
  const allSizes = Array.from(new Set(product.variants.map(v => v.size)))
  const isComplete = !!selectedColor && !!selectedSize

  // find the currently selected variant
  const selectedVariant = product.variants.find(
    v => v.color === selectedColor && v.size === selectedSize
  )
  const variantId = selectedVariant?.variant_id
  const isFavorite = variantId ? isInWishlist(variantId) : false

  // reset when selection changes
  useEffect(() => {
    setQuantity(1)
    setAddedToCart(false)
  }, [selectedColor, selectedSize])

  // sizes available for the chosen color
  const sizesForColor = selectedColor
    ? product.variants.filter(v => v.color === selectedColor).map(v => v.size)
    : allSizes
  // which of those are out of stock
  const disabledSizes = selectedColor
    ? product.variants
        .filter(v => v.color === selectedColor && !v.in_stock)
        .map(v => v.size)
    : []
  // colors without stock for chosen size
  const disabledColors = selectedSize
    ? product.variants
        .filter(v => v.size === selectedSize && !v.in_stock)
        .map(v => v.color)
    : []

  const handleAddToCart = async () => {
    if (!isComplete || !variantId) return
    await addItem(variantId, quantity)
    setAddedToCart(true)
  }
  const handleAddToFittingCart = async () => {
    if (!variantId) {
      alert("Please select a color & size first")
      return
    }
    try {
      await addRequest(variantId)
      alert("Added to fitting-room cart")
      router.reload()
    } catch (e: any) {
      alert(e.message)
    }
  }

  const formatPrice = (v: number) =>
    new Intl.NumberFormat("en-gb", {
      style:   "currency",
      currency:"GBP",
    }).format(v)

  return (
    <>
      <Head>
        <title>{`${product.name} | LUXE`}</title>
        <meta name="description" content={product.description.slice(0, 160)} />
      </Head>
      <Navbar />
      <CartDrawer />

      <main className="min-h-screen bg-stone-50 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <nav className="text-sm text-stone-500 mb-6">
            <ol className="flex space-x-2">
              <li><Link href="/" className="hover:text-amber-800">HOME</Link></li>
              <li>/</li>
              <li><Link href="/shop" className="hover:text-amber-800">SHOP</Link></li>
              <li>/</li>
              <li className="uppercase">{product.category}</li>
            </ol>
          </nav>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Image */}
            <div className="lg:w-3/5">
              <div className="aspect-[4/5] bg-stone-200 relative">
                <Image
                  src={productImages[product.name]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  priority
                />
              </div>
            </div>

            {/* Details */}
            <div className="lg:w-2/5 relative">
              {/* Wishlist */}
              <button
                onClick={() => variantId && toggleItem(variantId)}
                disabled={!variantId || wLoading}
                className={`absolute top-0 right-0 w-10 h-10 flex items-center justify-center
                  transition-colors ${isFavorite ? "text-red-500" : "text-stone-500 hover:text-amber-800"}
                  ${!variantId||wLoading ? "cursor-not-allowed" : "cursor-pointer"}`}
              >
                <Heart size={24} fill={isFavorite ? "currentColor" : "none"} strokeWidth={2}/>
              </button>

              <p className="text-sm text-stone-500 uppercase tracking-wider mb-1">{product.category}</p>
              <h1 className="text-3xl md:text-4xl font-light text-stone-900 mb-4">{product.name}</h1>
              <p className="text-xl text-amber-800 mb-6">{formatPrice(product.price)}</p>
              <p className="text-stone-700 mb-8">{product.description}</p>

              {/* Colors */}
              <div className="mb-6">
                <p className="text-sm font-medium text-stone-900 mb-2">
                  COLOR: {selectedColor ?? "Select a color"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {colors.map(c => {
                    const disabled = disabledColors.includes(c)
                    return (
                      <button
                        key={c}
                        onClick={() => !disabled && setSelectedColor(c)}
                        disabled={disabled}
                        className={`w-10 h-10 rounded-full border border-stone-300
                          transition-shadow focus:outline-none
                          ${selectedColor===c ? "shadow-[inset_0_0_0_2px_white,0_0_0_2px_black]" : ""}
                          ${disabled
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:shadow-[inset_0_0_0_2px_white,0_0_0_2px_black] cursor-pointer"}`}
                        style={{ backgroundColor: c.toLowerCase() }}
                        aria-label={`Select ${c}`}
                      />
                    )
                  })}
                </div>
              </div>

              {/* Sizes */}
              <div className="mb-8">
                <p className="text-sm font-medium text-stone-900 mb-2">
                  SIZE: {selectedSize ?? "Select a size"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {sizesForColor.map(s => {
                    const disabled = disabledSizes.includes(s)
                    return (
                      <button
                        key={s}
                        onClick={() => !disabled && setSelectedSize(s)}
                        disabled={disabled}
                        className={`min-w-[3rem] h-10 px-3 border
                          ${selectedSize===s ? "border-amber-800 bg-amber-800 text-white" : ""}
                          ${disabled
                            ? "opacity-50 cursor-not-allowed"
                            : "border-stone-300 text-stone-700 hover:border-stone-400 cursor-pointer"}`}
                      >
                        {s}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Quantity */}
              <div className="mb-6">
                <p className="text-sm font-medium text-stone-900 mb-2">QUANTITY</p>
                <div className="flex items-center w-32 border border-stone-300">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q-1))}
                    className="w-10 h-10 flex items-center justify-center text-stone-500 hover:text-stone-700"
                  >–</button>
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={e => setQuantity(Math.max(1, parseInt(e.target.value)||1))}
                    className="w-12 h-10 text-center text-stone-900 border-x border-stone-300 focus:outline-none"
                  />
                  <button
                    onClick={() => setQuantity(q => q+1)}
                    className="w-10 h-10 flex items-center justify-center text-stone-500 hover:text-stone-700"
                  >+</button>
                </div>
              </div>

              {/* Success message */}
              {addedToCart && (
                <div className="mb-4 p-3 bg-green-50 text-green-800 border border-green-200 rounded">
                  Item added to your cart successfully!
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                  onClick={handleAddToCart}
                  disabled={!isComplete}
                  className={`py-3 px-6 text-white text-sm tracking-wider ${
                    isComplete
                      ? "bg-stone-900 hover:bg-stone-800 cursor-pointer"
                      : "bg-stone-400 cursor-not-allowed"
                  }`}
                >
                  ADD TO CART
                </button>
                {inStore && (
                  <button
                    onClick={handleAddToFittingCart}
                    disabled={!isComplete}
                    className={`py-3 px-6 text-white text-sm tracking-wider ${
                      isComplete
                        ? "bg-amber-800 hover:bg-amber-700 cursor-pointer"
                        : "bg-stone-400 cursor-not-allowed"
                    }`}
                  >
                    ADD TO FITTING-ROOM CART
                  </button>
                )}
              </div>

              {/* Delivery note */}
              <div className="flex items-center text-stone-700 border-t border-stone-200 pt-6">
                <Truck size={18} className="mr-2" />
                <p className="text-sm">Free standard delivery on all orders</p>
              </div>
            </div>
          </div>

          {/* Extended details */}
          <div className="mt-16 border-t border-stone-200 pt-8">
            <h2 className="text-2xl font-light text-stone-900 mb-4">Product Details</h2>
            <div className="max-w-none text-stone-700">
              <p>
                The {product.name} embodies the pinnacle of LUXE craftsmanship and timeless elegance.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ params, req }) => {
  const productID = params?.productID as string
  const cookies = req.cookies as Record<string,string>
  const store_id  = cookies.store_id || process.env.NEXT_PUBLIC_DEFAULT_STORE_ID!

  // fetch product + stock
  const prod = await prisma.product.findUnique({
    where: { product_id: productID },
    select: {
      product_id:  true,
      name:        true,
      description: true,
      price:       true,
      category:    true,
      variants: {
        select: {
          variant_id: true,
          size:       true,
          color:      true,
          inventory: {
            where: { store_id },
            select: { quantity: true }
          }
        }
      }
    }
  })
  if (!prod) return { notFound: true }

  const product: Product = {
    product_id:  prod.product_id,
    name:        prod.name,
    description: prod.description,
    price:       prod.price,
    category:    prod.category,
    variants: prod.variants.map(v => ({
      variant_id: v.variant_id,
      size:       v.size,
      color:      v.color,
      in_stock:   (v.inventory[0]?.quantity ?? 0) > 0
    }))
  }

  return { props: { product } }
}
