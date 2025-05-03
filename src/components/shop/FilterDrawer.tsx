import { useEffect, useState } from "react"
import { Slider } from "@/components/ui/Slider"
import { ChevronDown, ChevronUp, X } from "lucide-react"

type SortOption = "default" | "price-asc" | "price-desc"

interface FilterState {
  categories: string[]
  priceRange: [number, number]
  sort: SortOption
}

interface FilterDrawerProps {
  isOpen: boolean
  onClose: () => void
  filters: FilterState
  categories: string[]
  expandedSections: { categories: boolean; price: boolean }
  toggleSection: (section: "categories" | "price") => void
  toggleCategory: (category: string) => void
  updatePriceRange: (range: [number, number]) => void
  updateSort: (sort: SortOption) => void
  minPrice: number
  maxPrice: number
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
  minPrice,
  maxPrice,
}: FilterDrawerProps) {
  const [localMin, setLocalMin] = useState(filters.priceRange[0])
  const [localMax, setLocalMax] = useState(filters.priceRange[1])

  useEffect(() => {
    setLocalMin(filters.priceRange[0])
    setLocalMax(filters.priceRange[1])
  }, [filters.priceRange])

  const handlePriceChange = () => {
    updatePriceRange([localMin, localMax])
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ${
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Blurred backdrop */}
      <div
        onClick={onClose}
        className={"absolute inset-0 bg-black opacity-70 backdrop-blur-sm transition-opacity duration-300"}
      />

      {/* Drawer panel */}
      <div
        className={`relative w-full max-w-md h-full bg-white bg-opacity-90 border-l border-stone-200 transform transition-transform duration-300 ${
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
            {/* Sort */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-stone-900 mb-4">Sort By</h3>
              <div className="space-y-2">
                {(["default", "price-asc", "price-desc"] as SortOption[]).map((opt) => (
                  <label key={opt} className="flex items-center text-stone-900">
                    <input
                      type="radio"
                      name="sort"
                      checked={filters.sort === opt}
                      onChange={() => updateSort(opt)}
                      className="mr-2 text-amber-800 focus:ring-amber-800"
                    />
                    {{ default: "Default", "price-asc": "Price ↑", "price-desc": "Price ↓" }[opt]}
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
                    <label key={cat} className="flex items-center text-stone-900">
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
                    value={[localMin, localMax]}
                    min={minPrice}
                    max={maxPrice}
                    step={1}
                    onValueChange={([min, max]) => {
                      setLocalMin(min)
                      setLocalMax(max)
                    }}
                    onValueCommit={handlePriceChange}
                    className="mt-6"
                  />

                  <div className="flex items-center justify-between">
                    {/* Min input */}
                    <div>
                      <label className="block text-sm text-stone-900 mb-1">Min</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-900">£</span>
                        <input
                          type="number"
                          value={localMin}
                          min={minPrice}
                          max={localMax}
                          onChange={(e) => setLocalMin(Number(e.target.value))}
                          onBlur={handlePriceChange}
                          className="pl-8 pr-3 py-2 text-stone-900 border border-stone-300 rounded w-24 focus:outline-none focus:ring-amber-800 focus:border-amber-800"
                        />
                      </div>
                    </div>

                    <div className="text-stone-900 mx-2">to</div>

                    {/* Max input */}
                    <div>
                      <label className="block text-sm text-stone-900 mb-1">Max</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-900">£</span>
                        <input
                          type="number"
                          value={localMax}
                          min={localMin}
                          max={maxPrice}
                          onChange={(e) => setLocalMax(Number(e.target.value))}
                          onBlur={handlePriceChange}
                          className="pl-8 pr-3 py-2 text-stone-900 border border-stone-300 rounded w-24 focus:outline-none focus:ring-amber-800 focus:border-amber-800"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Apply button */}
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
