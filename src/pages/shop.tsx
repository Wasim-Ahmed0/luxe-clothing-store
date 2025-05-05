import { useState, useEffect } from "react"
import Head from "next/head"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import ProductCard from "@/components/shop/ProductCard"
import FilterDrawer from "@/components/shop/FilterDrawer"
import CartDrawer from "@/components/cart/cart-drawer"
import { SlidersHorizontal } from "lucide-react"

interface Product {
  product_id: string
  name: string
  description: string
  price: number
  category: string
}

type SortOption = "default" | "price-asc" | "price-desc"

interface FilterState {
  categories: string[]
  priceRange: [number, number]
  sort: SortOption
}

export default function ShopPage() {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    priceRange: [0, 0],
    sort: "default",
  })
  const [allCategories, setAllCategories] = useState<string[]>([])
  const [priceBounds, setPriceBounds] = useState<[number, number]>([0, 0])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
  })

  // helper to read store_id cookie or fallback to env default
  const getStoreId = (): string => {
    if (typeof document !== "undefined") {
      const m = document.cookie.match(/(?:^|;\s*)store_id=([^;]+)/)
      if (m?.[1]) return m[1]
    }
    return process.env.NEXT_PUBLIC_DEFAULT_STORE_ID!
  }

  useEffect(() => {
    async function fetchProductsForStore() {
      setLoading(true)
      setError(null)

      try {
        const storeId = getStoreId()

        // include inStock=true to filter out of stock variants
        const params = new URLSearchParams({
          store_id: storeId,
          sort:
            filters.sort === "price-asc"
              ? "price_asc"
              : filters.sort === "price-desc"
              ? "price_desc"
              : "",
          inStock: "true",
        })        

        const res = await fetch(`/api/products?${params.toString()}`)
        const data = await res.json()
        if (!data.success || !Array.isArray(data.products)) {
          throw new Error("Invalid products response")
        }

        const fetched = data.products as Product[]
        setProducts(fetched)

        // derive unique categories
        const cats = Array.from(new Set(fetched.map((p) => p.category)))
        setAllCategories(cats)

        // derive price bounds
        const prices = fetched.map((p) => p.price)
        const minPrice = Math.min(...prices)
        const maxPrice = Math.max(...prices)
        setPriceBounds([minPrice, maxPrice])

        // initialize filters
        setFilters({
          categories: [],
          priceRange: [minPrice, maxPrice],
          sort: filters.sort,
        })
      } catch (err) {
        console.error(err)
        setError("Failed to load products")
      } finally {
        setLoading(false)
      }
    }

    fetchProductsForStore()
  // re-run when sort changes
  }, [filters.sort])

  const filteredProducts = products
    .filter((p) => {
      if (filters.categories.length && !filters.categories.includes(p.category)) return false
      const [min, max] = filters.priceRange
      return p.price >= min && p.price <= max
    })

  return (
    <>
      <Head>
        <title>Shop All | LUXE</title>
        <meta name="description" content="Discover the finest in men's luxury fashion at LUXE." />
      </Head>

      <Navbar />
      <CartDrawer />

      <main className="min-h-screen bg-stone-50 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8 border-b border-stone-200 pb-4">
            <h1 className="text-3xl font-light tracking-wider text-stone-900">SHOP ALL</h1>
            <button
              onClick={() => setIsFilterOpen(true)}
              className="flex items-center text-sm text-stone-700 hover:text-amber-800 transition-colors cursor-pointer"
            >
              <SlidersHorizontal size={16} className="mr-2" />
              Filter & Sort
            </button>
          </div>

          {loading ? (
            <p className="text-center text-stone-500">Loading products...</p>
          ) : error ? (
            <p className="text-center text-red-600">{error}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product, i) => (
                <ProductCard key={`${product.product_id}-${i}`} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>

      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        categories={allCategories}
        expandedSections={expandedSections}
        toggleSection={(section) =>
          setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
        }
        toggleCategory={(category) =>
          setFilters((f) => ({
            ...f,
            categories: f.categories.includes(category)
              ? f.categories.filter((x) => x !== category)
              : [...f.categories, category],
          }))
        }
        updatePriceRange={(range) => setFilters((f) => ({ ...f, priceRange: range }))}
        updateSort={(sort) => setFilters((f) => ({ ...f, sort }))}
        minPrice={priceBounds[0]}
        maxPrice={priceBounds[1]}
      />

      <Footer />
    </>
  )
}
