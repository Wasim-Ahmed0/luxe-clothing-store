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

const dummyResponse: { success: true; products: Product[] } = {
  success: true,
  products: Array(12).fill({
    product_id: "1",
    name: "Savile Row Signature Suit",
    description: "Two-piece wool suit with peak lapels.",
    price: 799.99,
    category: "Suits",
  }),
}

export default function ShopPage() {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    priceRange: [0, 2000],
    sort: "default",
  })

  const categories = ["Suits", "Outerwear", "Shirts", "Footwear", "Accessories"]
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
  })

  useEffect(() => {
    setProducts(dummyResponse.products)
  }, [])

  const filteredProducts = products
    .filter((p) => {
      if (filters.categories.length && !filters.categories.includes(p.category)) return false
      if (p.price < filters.priceRange[0] || p.price > filters.priceRange[1]) return false
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

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product, i) => (
              <ProductCard key={`${product.product_id}-${i}`} product={product} />
            ))}
          </div>
        </div>
      </main>

      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        categories={categories}
        expandedSections={expandedSections}
        toggleSection={(s) =>
          setExpandedSections((prev) => ({ ...prev, [s]: !prev[s] }))
        }
        toggleCategory={(c) =>
          setFilters((f) => ({
            ...f,
            categories: f.categories.includes(c)
              ? f.categories.filter((x) => x !== c)
              : [...f.categories, c],
          }))
        }
        updatePriceRange={(r) => setFilters((f) => ({ ...f, priceRange: r }))}
        updateSort={(s) => setFilters((f) => ({ ...f, sort: s }))}
      />

      <Footer />
    </>
  )
}
