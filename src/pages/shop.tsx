import { useState, useEffect } from "react"
import Head from "next/head"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import ProductCard from "@/components/shop/ProductCard"
import FilterDrawer from "@/components/shop/FilterDrawer"
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

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/products')
        const data = await res.json()
        if (data.success && Array.isArray(data.products)) {
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
          setFilters((prev) => ({
            ...prev,
            categories: [],
            priceRange: [minPrice, maxPrice],
          }))
        } else {
          setError('Failed to load products')
        }
      } catch {
        setError('An error occurred while fetching products')
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const filteredProducts = products
    .filter((p) => {
      if (filters.categories.length && !filters.categories.includes(p.category)) return false
      const [min, max] = filters.priceRange
      if (p.price < min || p.price > max) return false
      return true
    })
    .sort((a, b) => {
      if (filters.sort === "price-asc") return a.price - b.price
      if (filters.sort === "price-desc") return b.price - a.price
      return 0
    })

  return (
    <>
      <Head>
        <title>Shop All | LUXE</title>
        <meta name="description" content="Discover the finest in men's luxury fashion at LUXE." />
      </Head>

      <Navbar />

      <main className="min-h-screen bg-stone-50 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8 border-b border-stone-200 pb-4">
            <h1 className="text-3xl font-light tracking-wider text-stone-900">SHOP ALL</h1>
            <button
              onClick={() => setIsFilterOpen(true)}
              className="flex items-center text-sm text-stone-700 hover:text-amber-800 transition-colors"
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
