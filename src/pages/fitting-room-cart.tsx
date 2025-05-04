// // pages/fitting-room-cart.tsx
// import { useEffect, useState } from "react"
// import { Trash2 } from "lucide-react";
// import { useRouter } from "next/router"
// import Navbar from "@/components/layout/Navbar"
// import Footer from "@/components/layout/Footer"
// import { useFittingCart, FitRequest } from "@/context/fitting-cart-context"

// interface EnrichedRequest extends FitRequest {
//   name: string
//   size: string
//   color: string
//   image: string
// }

// const PLACEHOLDER_IMAGE = "/placeholder.svg"  // ← your hard-coded placeholder

// const getStoreId = (): string => {
//   if (typeof document !== "undefined") {
//     const m = document.cookie.match(/(?:^|;\s*)store_id=([^;]+)/)
//     if (m?.[1]) return m[1]
//   }
//   return process.env.NEXT_PUBLIC_DEFAULT_STORE_ID!
// }

// export default function FittingRoomCartPage() {
//   const router = useRouter()
//   const { fitCartId, requests, transferToCart } = useFittingCart()
//   const [enriched, setEnriched] = useState<EnrichedRequest[]>([])
//   const defaultStore = process.env.NEXT_PUBLIC_DEFAULT_STORE_ID!
//   const sid = getStoreId()

//   // Redirect away if not in-store
//   useEffect(() => {
//     if (sid === defaultStore) {
//       router.replace("/shop")
//     }
//   }, [sid, router])

//   // Whenever requests update, look up product details
//   useEffect(() => {
//     if (!requests.length) {
//       setEnriched([])
//       return
//     }

//     Promise.all(
//       requests.map(async (r) => {
//         const resp = await fetch(`/api/products?variantID=${r.variant_id}`)
//         const j = await resp.json()
//         if (!j.success) throw new Error(j.error || "Lookup failed")

//         const p = (j as any).product
//         return {
//           ...r,
//           name: p.name,
//           size: p.variant.size,
//           color: p.variant.color,
//           image: PLACEHOLDER_IMAGE,   // ← always use the placeholder
//         } as EnrichedRequest
//       })
//     )
//       .then(setEnriched)
//       .catch(console.error)
//   }, [requests])

//   const handleTransfer = async () => {
//     try {
//       const newCartId = await transferToCart()
//       router.push(`/checkout?cart_id=${newCartId}&store_id=${sid}`)
//     } catch (err: any) {
//       alert(err.message)
//     }
//   }

//   return (
//     <>
//       <Navbar />
//       <main className="min-h-screen py-24 px-4 bg-stone-50">
//         <div className="max-w-xl mx-auto bg-white rounded-lg shadow p-6">
//           <h1 className="text-3xl font-light mb-6 tracking-wider text-stone-900">Fitting-Room Cart</h1>
//           {enriched.length === 0 ? (
//             <p className="text-stone-600">You haven’t added any items yet.</p>
//           ) : (
//             <ul className="divide-y">
//               {enriched.map((r) => (
//                 <li
//                   key={r.request_id}
//                   className="py-4 flex items-center gap-4"
//                 >
//                   <img
//                     src={r.image}
//                     alt={r.name}
//                     className="w-16 h-16 object-cover rounded"
//                   />
//                   <div className="flex-1 text-left">
//                     <h2 className=" font-medium text-lg text-stone-900 ">{r.name}</h2>
//                     <p className="text-xs text-amber-900">
//                       Size: {r.size}
//                       {r.color && ` • ${r.color}`}
//                     </p>
//                   </div>
//                   <Trash2 
//                     size={20} 
//                     className="mr-2 text-red-700 transition-colors transition-transform duration-200 
//                       ease-in-out transform hover:text-red-800 hover:-translate-y-1 hover:scale-110" 
//                   />
//                 </li>
//               ))}
//             </ul>
//           )}

//           <button
//             onClick={handleTransfer}
//             disabled={enriched.length === 0}
//             className={`mt-6 w-full py-2 rounded text-white ${
//               enriched.length
//                 ? "bg-amber-800 hover:bg-amber-700"
//                 : "bg-gray-300 cursor-not-allowed"
//             }`}
//           >
//             Transfer to Cart & Checkout
//           </button>
//         </div>
//       </main>
//       <Footer />
//     </>
//   )
// }


import { useEffect, useState } from "react"
import { Trash2 } from "lucide-react"
import { useRouter } from "next/router"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useFittingCart, FitRequest } from "@/context/fitting-cart-context"

interface EnrichedRequest extends FitRequest {
  name: string
  size: string
  color: string
  image: string
}

const PLACEHOLDER_IMAGE = "/placeholder.svg"

const getStoreId = (): string => {
  if (typeof document !== "undefined") {
    const m = document.cookie.match(/(?:^|;\s*)store_id=([^;]+)/)
    if (m?.[1]) return m[1]
  }
  return process.env.NEXT_PUBLIC_DEFAULT_STORE_ID!
}

export default function FittingRoomCartPage() {
  const router = useRouter()
  const { fitCartId, requests, removeRequest, transferToCart } = useFittingCart()
  const [enriched, setEnriched] = useState<EnrichedRequest[]>([])
  const defaultStore = process.env.NEXT_PUBLIC_DEFAULT_STORE_ID!
  const sid = getStoreId()

  // redirect away if not in-store
  useEffect(() => {
    if (sid === defaultStore) {
      router.replace("/shop")
    }
  }, [sid, router])

  // enrich each request with product details
  useEffect(() => {
    if (!requests.length) {
      setEnriched([])
      return
    }
    Promise.all(
      requests.map(async (r) => {
        const resp = await fetch(`/api/products?variantID=${r.variant_id}`)
        const j = await resp.json()
        if (!j.success) throw new Error(j.error || "Lookup failed")
        const p = (j as any).product
        return {
          ...r,
          name:  p.name,
          size:  p.variant.size,
          color: p.variant.color,
          image: PLACEHOLDER_IMAGE,
        } as EnrichedRequest
      })
    )
      .then(setEnriched)
      .catch(console.error)
  }, [requests])

  const handleRemove = async (requestId: string) => {
    if (!confirm("Remove this item from your fitting-room cart?")) return
    try {
      await removeRequest(requestId)
    } catch (e: any) {
      alert(e.message)
    }
  }

  const handleTransfer = async () => {
    try {
      const newCartId = await transferToCart()
      // persist the cart_id for the next 24h
      document.cookie = `cart_id=${newCartId}; path=/; max-age=${60 * 60 * 24}`
      router.push(`shop`)
    } catch (e: any) {
      alert(e.message)
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen py-24 px-4 bg-stone-50">
        <div className="max-w-xl mx-auto bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-light mb-6 tracking-wider text-stone-900">
            Fitting-Room Cart
          </h1>

          {enriched.length === 0 ? (
            <p className="text-stone-600">You haven’t added any items yet.</p>
          ) : (
            <ul className="divide-y">
              {enriched.map((r) => (
                <li
                  key={r.request_id}
                  className="py-4 flex items-center gap-4"
                >
                  <img
                    src={r.image}
                    alt={r.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1 text-left">
                    <h2 className="font-medium text-lg text-stone-900">
                      {r.name}
                    </h2>
                    <p className="text-xs text-amber-900 mt-1">
                      Size: {r.size}
                      {r.color && ` • ${r.color}`}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemove(r.request_id)}
                    className="p-1 text-red-700 hover:text-red-800 transition-colors transition-transform duration-200 
//                       ease-in-out transform hover:-translate-y-1 hover:scale-100 cursor-pointer"
                    aria-label="Remove request"
                  >
                    <Trash2 size={20} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <button
            onClick={handleTransfer}
            disabled={enriched.length === 0}
            className={`mt-6 w-full py-2 rounded text-white ${
              enriched.length
                ? "bg-amber-800 hover:bg-amber-700 cursor-pointer"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            Transfer to Cart & Checkout
          </button>
        </div>
      </main>
      <Footer />
    </>
  )
}
