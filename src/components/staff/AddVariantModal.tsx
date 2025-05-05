// import React, { useState } from "react"
// import {
//   Dialog,
//   DialogTrigger,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
//   DialogFooter,
//   DialogClose,
// } from "@/components/ui/dialog"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import {
//   Select,
//   SelectTrigger,
//   SelectValue,
//   SelectContent,
//   SelectItem,
// } from "@/components/ui/select"

// interface Props {
//   productId: string
//   productName: string
//   storeId: string
//   onCreated: (variantId: string, size: string, color: string, quantity: number, status: string) => void
//   children?: React.ReactNode
// }

// export default function AddVariantModal({ productId, productName, storeId, onCreated, children }: Props) {
//   const [open, setOpen] = useState(false)
//   const [size, setSize] = useState("")
//   const [color, setColor] = useState("")
//   const [quantity, setQuantity] = useState(0)
//   const [status, setStatus] = useState<"available"|"unavailable"|"discontinued">("available")
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState<string|null>(null)

//   const handleSubmit = async () => {
//     setError(null)
//     if (!size || !color || quantity < 0) {
//       setError("All fields are required")
//       return
//     }
//     setLoading(true)
//     try {
//       // 1) create the new variant
//       const res1 = await fetch(`/api/products/${productId}/variants`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ size, color }),
//       })
//       const j1 = await res1.json()
//       if (!res1.ok || !j1.success) {
//         throw new Error(j1.error || "Failed to create variant")
//       }
//       const variantId = j1.variant.variant_id as string

//       // 2) create its inventory row
//       const res2 = await fetch("/api/inventory", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           store_id:   storeId,
//           product_id: productId,
//           variant_id: variantId,
//           quantity,
//           status,
//         }),
//       })
//       const j2 = await res2.json()
//       if (!res2.ok || !j2.success) {
//         throw new Error(j2.error || "Failed to add inventory")
//       }

//       onCreated(variantId, size, color, quantity, status)
//       setOpen(false)
//     } catch (e:any) {
//       setError(e.message)
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <Dialog open={open} onOpenChange={setOpen}>
//       <DialogTrigger asChild>
//         {children ?? <Button variant="outline" size="sm">Add Variant</Button>}
//       </DialogTrigger>
//       <DialogContent className="sm:max-w-md">
//         <DialogHeader>
//           <DialogTitle>Add Variant for “{productName}”</DialogTitle>
//           <DialogDescription>
//             Specify size, colour and initial stock.
//           </DialogDescription>
//         </DialogHeader>

//         <div className="grid gap-4 py-4">
//           <div className="grid grid-cols-1">
//             <label className="text-sm font-medium">Size</label>
//             <Input value={size} onChange={e => setSize(e.target.value)} placeholder="e.g. M, L, XL" />
//           </div>
//           <div className="grid grid-cols-1">
//             <label className="text-sm font-medium">Color</label>
//             <Input value={color} onChange={e => setColor(e.target.value)} placeholder="e.g. Navy" />
//           </div>
//           <div className="grid grid-cols-1">
//             <label className="text-sm font-medium">Quantity</label>
//             <Input
//               type="number"
//               min={0}
//               value={quantity}
//               onChange={e => setQuantity(parseInt(e.target.value, 10))}
//             />
//           </div>
//           <div className="grid grid-cols-1">
//             <label className="text-sm font-medium">Status</label>
//             <Select value={status} onValueChange={v => setStatus(v as any)}>
//               <SelectTrigger><SelectValue /></SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="available">Available</SelectItem>
//                 <SelectItem value="unavailable">Unavailable</SelectItem>
//                 <SelectItem value="discontinued">Discontinued</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>
//           {error && <p className="text-red-600 text-sm">{error}</p>}
//         </div>

//         <DialogFooter>
//           <DialogClose asChild>
//             <Button variant="outline">Cancel</Button>
//           </DialogClose>
//           <Button onClick={handleSubmit} disabled={loading}>
//             {loading ? "Saving…" : "Create Variant"}
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   )
// }


import React, { useState } from "react"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"

interface Props {
  productId: string
  productName: string
  storeId: string
  onCreated: (variantId: string, size: string, color: string, quantity: number, status: string) => void
  children?: React.ReactNode
}

export default function AddVariantModal({ productId, productName, storeId, onCreated, children }: Props) {
  const [open, setOpen] = useState(false)
  const [size, setSize] = useState("")
  const [color, setColor] = useState("")
  const [quantity, setQuantity] = useState(0)
  const [status, setStatus] = useState<"available"|"unavailable"|"discontinued">("available")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string|null>(null)

  const handleSubmit = async () => {
    setError(null)
    if (!size || !color || quantity < 0) {
      setError("All fields are required and quantity must be zero or more")
      return
    }
    setLoading(true)
    try {
      // Create variant and its inventory in a single request
      const res = await fetch(`/api/products/${productId}/variants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ size, color, quantity, status }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to create variant and inventory")
      }
      const variantId = json.variant.variant_id as string
      onCreated(variantId, size, color, quantity, status)
      setOpen(false)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ?? <Button variant="outline" size="sm">Add Variant</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Variant for “{productName}”</DialogTitle>
          <DialogDescription>
            Specify size, colour and initial stock.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1">
            <label className="text-sm font-medium">Size</label>
            <Input value={size} onChange={e => setSize(e.target.value)} placeholder="e.g. M, L, XL" />
          </div>
          <div className="grid grid-cols-1">
            <label className="text-sm font-medium">Color</label>
            <Input value={color} onChange={e => setColor(e.target.value)} placeholder="e.g. Navy" />
          </div>
          <div className="grid grid-cols-1">
            <label className="text-sm font-medium">Quantity</label>
            <Input
              type="number"
              min={0}
              value={quantity}
              onChange={e => setQuantity(parseInt(e.target.value, 10) || 0)}
            />
          </div>
          <div className="grid grid-cols-1">
            <label className="text-sm font-medium">Status</label>
            <Select value={status} onValueChange={v => setStatus(v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="unavailable">Unavailable</SelectItem>
                <SelectItem value="discontinued">Discontinued</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving…" : "Create Variant"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
