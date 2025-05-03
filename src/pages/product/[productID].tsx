import { useState } from "react"
import Head from "next/head"
import Image from "next/image"
import Link from "next/link"
import { GetServerSideProps } from "next"
import { Heart, Truck } from "lucide-react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import suitImg from "../../../public/images/Savile Row Suit.png" // placeholder image

interface Variant {
  variant_id: string
  size: string
  color: string
  in_stock: boolean
}

interface Product {
  product_id: string
  name: string
  description: string
  price: number
  category: string
  variants: Variant[]
}

interface ProductDetailProps {
  product: Product
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  
  const hasStore = false

  // derive colors and sizes
  const colors = Array.from(new Set(product.variants.map((v) => v.color)))
  const sizes = Array.from(new Set(product.variants.map((v) => v.size)))
  const isComplete = !!selectedColor && !!selectedSize

  const handleAddToCart = () => {
    if (!isComplete) return
    const variant = product.variants.find(
      (v) => v.color === selectedColor && v.size === selectedSize
    )
    console.log("Adding to cart:", variant)
    // add cart logic here
  }

  return (
    <>
      <Head>
        <title>{`${product.name} | LUXE`}</title>
        <meta name="description" content={product.description.slice(0, 160)} />
      </Head>

      <Navbar />

      <main className="min-h-screen bg-stone-50 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <nav className="text-sm text-stone-500 mb-6">
            <ol className="flex space-x-2">
              <li>
                <Link href="/" className="hover:text-amber-800 transition-colors">
                  HOME
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link href="/shop" className="hover:text-amber-800 transition-colors">
                  SHOP
                </Link>
              </li>
              <li>/</li>
              <li className="uppercase">{product.category}</li>
            </ol>
          </nav>

          {/* Product layout */}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Image */}
            <div className="lg:w-3/5">
              <div className="aspect-[4/5] bg-stone-200 relative">
                <Image
                  src={suitImg}
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
              <button className="absolute top-0 right-0 w-10 h-10 flex items-center justify-center text-stone-500 hover:text-amber-800">
                <Heart size={24} />
              </button>

              <p className="text-sm text-stone-500 uppercase tracking-wider mb-1">
                {product.category}
              </p>
              <h1 className="text-3xl md:text-4xl font-light text-stone-900 mb-4">
                {product.name}
              </h1>
              <p className="text-xl text-amber-800 mb-6">
                ${product.price.toFixed(2)}
              </p>
              <p className="text-stone-700 mb-8">{product.description}</p>

              {/* Colors */}
              <div className="mb-6">
                <p className="text-sm font-medium text-stone-900 mb-2">
                  COLOR: {selectedColor ?? "Select a color"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {colors.map((c) => {
                    const lower = c.toLowerCase()
                    return (
                      <button
                        key={c}
                        onClick={() => setSelectedColor(c)}
                        className={`w-10 h-10 rounded-full border border-stone-300 transition-shadow focus:outline-none
                          ${selectedColor === c
                            ? 'shadow-[inset_0_0_0_2px_white,0_0_0_2px_black]'
                            : ''}
                          hover:shadow-[inset_0_0_0_2px_white,0_0_0_2px_black]`}
                        style={{ backgroundColor: lower }}
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
                  {sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`min-w-[3rem] h-10 px-3 border ${
                        selectedSize === s
                          ? "border-amber-800 bg-amber-800 text-white"
                          : "border-stone-300 text-stone-700 hover:border-stone-400"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                  onClick={handleAddToCart}
                  disabled={!isComplete}
                  className={`py-3 px-6 text-white text-sm tracking-wider ${
                    isComplete
                      ? "bg-stone-900 hover:bg-stone-800"
                      : "bg-stone-400 cursor-not-allowed"
                  }`}>
                  ADD TO CART
                </button>
                {hasStore && (
                  <button
                    onClick={handleAddToCart}
                    disabled={!isComplete}
                    className={`py-3 px-6 text-white text-sm tracking-wider ${
                      isComplete
                        ? "bg-amber-800 hover:bg-amber-700"
                        : "bg-stone-400 cursor-not-allowed"
                    }`}>
                    ADD TO FITTING ROOM
                  </button>
                )}
              </div>

              {/* Delivery */}
              <div className="flex items-center text-stone-700 border-t border-stone-200 pt-6">
                <Truck size={18} className="mr-2" />
                <p className="text-sm">Free standard delivery on all orders</p>
              </div>
            </div>
          </div>

          {/* Extended details */}
          <div className="mt-16 border-t border-stone-200 pt-8">
            <h2 className="text-2xl font-light text-stone-900 mb-4">
              Product Details
            </h2>
            <div className="max-w-none text-stone-700">
              <p>
                The {product.name} embodies the pinnacle of LUXE craftsmanship and timeless elegance.
              </p>
              {/* ... you can keep static extended details or fetch more if needed */}
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
  const host = req.headers.host
  const protocol = host?.includes("localhost") ? "http" : "https"
  const res = await fetch(
    `${protocol}://${host}/api/products/${productID}`
  )
  if (!res.ok) {
    return { notFound: true }
  }
  const data = await res.json()
  if (!data.success) {
    return { notFound: true }
  }
  return {
    props: { product: data.product },
  }
}
