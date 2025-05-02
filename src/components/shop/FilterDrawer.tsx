import { useEffect, useState } from "react"
import { Slider } from "@/components/ui/Slider"
import { ChevronDown, ChevronUp, X,} from "lucide-react"

type SortOption = "default" | "price-asc" | "price-desc"
interface FilterState {
  categories: string[]
  priceRange: [number, number]
  sort: SortOption
}

export default function FilterDrawer({
  isOpen,
  onClose,
  filters,
  categories,
  expandedSections,
  toggleSection,
  toggleCategory,
  updatePriceRange,
  updateSort,
}: {
  isOpen: boolean
  onClose: () => void
  filters: FilterState
  categories: string[]
  expandedSections: { categories: boolean; price: boolean }
  toggleSection: (section: "categories" | "price") => void
  toggleCategory: (category: string) => void
  updatePriceRange: (range: [number, number]) => void
  updateSort: (sort: SortOption) => void
}) {
  const [minPrice, setMinPrice] = useState(filters.priceRange[0])
  const [maxPrice, setMaxPrice] = useState(filters.priceRange[1])

  useEffect(() => {
    setMinPrice(filters.priceRange[0])
    setMaxPrice(filters.priceRange[1])
  }, [filters.priceRange])

  const handlePriceChange = () => {
    updatePriceRange([minPrice, maxPrice])
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ${
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isOpen ? "bg-opacity-30" : "bg-opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`relative w-full max-w-md bg-white h-full transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-stone-200">
            <h2 className="text-xl font-light text-stone-900">Filter & Sort</h2>
            <button onClick={onClose} className="text-stone-500 hover:text-stone-700">
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Sort By */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-stone-900 mb-4">Sort By</h3>
              <div className="space-y-2">
                {(["default", "price-asc", "price-desc"] as SortOption[]).map((opt) => (
                  <label key={opt} className="flex items-center">
                    <input
                      type="radio"
                      name="sort"
                      checked={filters.sort === opt}
                      onChange={() => updateSort(opt)}
                      className="mr-2 text-amber-800 focus:ring-amber-800"
                    />
                    {{
                      default: "Default",
                      "price-asc": "Price Low → High",
                      "price-desc": "Price High → Low",
                    }[opt]}
                  </label>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div className="mb-8 border-t border-stone-200 pt-6">
              <button
                onClick={() => toggleSection("categories")}
                className="flex justify-between items-center w-full text-left mb-4"
              >
                <h3 className="text-lg font-medium text-stone-900">Categories</h3>
                {expandedSections.categories ? (
                  <ChevronUp size={20} className="text-stone-500" />
                ) : (
                  <ChevronDown size={20} className="text-stone-500" />
                )}
              </button>

              {expandedSections.categories && (
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <label key={cat} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.categories.includes(cat)}
                        onChange={() => toggleCategory(cat)}
                        className="mr-2 text-amber-800 focus:ring-amber-800"
                      />
                      {cat}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Price Range */}
            <div className="mb-8 border-t border-stone-200 pt-6">
              <button
                onClick={() => toggleSection("price")}
                className="flex justify-between items-center w-full text-left mb-4"
              >
                <h3 className="text-lg font-medium text-stone-900">Price Range</h3>
                {expandedSections.price ? (
                  <ChevronUp size={20} className="text-stone-500" />
                ) : (
                  <ChevronDown size={20} className="text-stone-500" />
                )}
              </button>

              {expandedSections.price && (
                <div className="space-y-6">
                  <Slider
                    defaultValue={[minPrice, maxPrice]}
                    min={0}
                    max={2000}
                    step={10}
                    value={[minPrice, maxPrice]}
                    onValueChange={(val) => {
                      setMinPrice(val[0])
                      setMaxPrice(val[1])
                    }}
                    onValueCommit={handlePriceChange}
                    className="mt-6"
                  />

                  <div className="flex items-center justify-between">
                    {/* Min */}
                    <div>
                      <label className="block text-sm text-stone-500 mb-1">Min</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-500">$</span>
                        <input
                          type="number"
                          value={minPrice}
                          onChange={(e) => setMinPrice(Number(e.target.value))}
                          onBlur={handlePriceChange}
                          className="pl-8 pr-3 py-2 border border-stone-300 rounded w-24 focus:outline-none focus:ring-1 focus:ring-amber-800 focus:border-amber-800"
                        />
                      </div>
                    </div>
                    <div className="text-stone-400">to</div>
                    {/* Max */}
                    <div>
                      <label className="block text-sm text-stone-500 mb-1">Max</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-500">$</span>
                        <input
                          type="number"
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(Number(e.target.value))}
                          onBlur={handlePriceChange}
                          className="pl-8 pr-3 py-2 border border-stone-300 rounded w-24 focus:outline-none focus:ring-1 focus:ring-amber-800 focus:border-amber-800"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Apply */}
          <div className="p-6 border-t border-stone-200">
            <button
              onClick={onClose}
              className="w-full py-3 bg-amber-800 text-white hover:bg-amber-700 transition-colors text-sm tracking-widest"
            >
              APPLY FILTERS
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
