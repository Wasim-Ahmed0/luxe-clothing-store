import { useEffect, useState } from "react"
import { useWishlist } from "@/context/wishlist-context"

interface Variant {
  variant_id: string
  name: string
}

export default function WishlistSection() {
  const { items: raw, removeItem } = useWishlist()
  const [list, setList] = useState<Variant[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        // 1) fetch the raw wishlist
        const res = await fetch("/api/wishlist")
        const j = await res.json()
        if (!j.success) {
          setList([])
          return
        }

        // 2) for each variant_id, fetch the product name
        const enriched: Variant[] = await Promise.all(
          j.items.map(async (i: { variant_id: string }) => {
            let name = i.variant_id // fallback
            try {
              const pr = await fetch(
                `/api/products?variantID=${i.variant_id}`
              )
              const pj = await pr.json()
              if (pj.success) {
                name = pj.product.name
              }
            } catch {
              // ignore
            }
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
  if (!list.length)
    return <p className="text-stone-600">Your wishlist is empty.</p>

  return (
    <ul className="space-y-4">
      {list.map((i) => (
        <li
          key={i.variant_id}
          className="flex justify-between items-center border p-4 rounded"
        >
          <p className="text-stone-900">
            {i.name}
          </p>
          <button
            onClick={() => {
              removeItem(i.variant_id)
              setList((l) =>
                l.filter((x) => x.variant_id !== i.variant_id)
              )
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
