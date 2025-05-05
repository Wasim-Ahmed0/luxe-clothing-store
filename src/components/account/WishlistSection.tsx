import { useEffect, useState } from "react"
import { useWishlist } from "@/context/wishlist-context"
import Image from "next/image"
import productImages from "@/lib/product-images"

interface Variant {
  variant_id: string
  name: string
}

export default function WishlistSection() {
  const { removeItem } = useWishlist()
  const [list, setList] = useState<Variant[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      // fetch wishlist
      try { 
        const res = await fetch("/api/wishlist")
        const j = await res.json()
        if (!j.success) {
          setList([])
          return
        }

        // for each variant_id, fetch the product name
        const enriched: Variant[] = await Promise.all(
          j.items.map(async (i: { variant_id: string }) => {
            let name = i.variant_id // fallback name
            try {
              const pr = await fetch(`/api/products?variantID=${i.variant_id}`)
              const pj = await pr.json()
              if (pj.success) {
                name = pj.product.name
              }
            } catch {}
            return { variant_id: i.variant_id, name }
          })
        )

        setList(enriched)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <p>Loading your wishlist…</p>
  if (!list.length) return <p className="text-stone-600">Your wishlist is empty.</p>

  return (
    <ul className="space-y-4">
      {list.map((i) => (
        <li
          key={i.variant_id}
          className="flex items-center justify-between gap-4 border p-4 rounded"
        >
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 bg-stone-100 rounded overflow-hidden">
              <Image
                src={productImages[i.name] || "/placeholder.svg"}
                alt={i.name}
                fill
                className="object-cover"
              />
            </div>
            <p className="text-stone-900">{i.name}</p>
          </div>

          <button
            onClick={() => {
              removeItem(i.variant_id)
              setList((l) => l.filter((x) => x.variant_id !== i.variant_id))
            }}
            className="text-red-600 hover:text-red-800 cursor-pointer"
          >
            Remove
          </button>
        </li>
      ))}
    </ul>
  )
}
