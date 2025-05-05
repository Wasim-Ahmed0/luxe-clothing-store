// components/staff/AddInventoryItem.tsx
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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

type Status = "available" | "unavailable" | "discontinued"

export default function AddInventoryItem() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState<number | "">("")
  const [category, setCategory] = useState("")
  const [size, setSize] = useState("")
  const [color, setColor] = useState("")
  const [quantity, setQuantity] = useState<number | "">(0)
  const [status, setStatus] = useState<Status>("available")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    // basic client-side guard
    if (
      !name ||
      !description ||
      typeof price !== "number" ||
      !category ||
      !size ||
      !color ||
      typeof quantity !== "number"
    ) {
      setError("All fields are required and must be valid.")
      setLoading(false)
      return
    }

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          price,
          category,
          size,
          color,
          quantity,
          status,
        }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to add product")
      }
      // on success, just reload to pick up new inventory row
      window.location.reload()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="cursor-pointer">
          Add New Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg bg-stone-50">
        <DialogHeader>
          <DialogTitle className="text-stone-900">Add New Product + Variant</DialogTitle>
          <DialogDescription>
            Create a product, its first variant, and stock record—all in one.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1">
            <label className="text-sm font-medium text-stone-500">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="placeholder:text-stone-300 text-stone-900"
              placeholder="e.g. Classic Oxford Shirt"
            />
          </div>
          <div className="grid grid-cols-1">
            <label className="text-sm font-medium text-stone-500">Description</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="placeholder:text-stone-300 text-stone-900"
              placeholder="Short product description"
            />
          </div>
          <div className="grid grid-cols-1">
            <label className="text-sm font-medium text-stone-500">Price (£)</label>
            <Input
              type="number"
              step="0.01"
              value={price}
              placeholder="0.00"
              className="placeholder:text-stone-300 text-stone-900"
              onChange={(e) => setPrice(parseFloat(e.target.value))}
            />
          </div>
          <div className="grid grid-cols-1">
            <label className="text-sm font-medium text-stone-500">Category</label>
            <Input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="placeholder:text-stone-300 text-stone-900"
              placeholder="e.g. Shirts"
            />
          </div>
          <div className="grid grid-cols-1">
            <label className="text-sm font-medium text-stone-500">Variant Size</label>
            <Input
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="placeholder:text-stone-300 text-stone-900"
              placeholder="e.g. M, L, XL"
            />
          </div>
          <div className="grid grid-cols-1">
            <label className="text-sm font-medium text-stone-500">Variant Color</label>
            <Input
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="placeholder:text-stone-300 text-stone-900"
              placeholder="e.g. Navy"
            />
          </div>
          <div className="grid grid-cols-1">
            <label className="text-sm font-medium text-stone-500">Initial Stock Quantity</label>
            <Input
              type="number"
              min={0}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
              className="placeholder:text-stone-300 text-stone-900"
            />
          </div>
          <div className="grid grid-cols-1">
            <label className="text-sm font-medium text-stone-500">Product Status</label>
            <Select value={status} onValueChange={(v) => setStatus(v as Status)}>
              <SelectTrigger className="cursor-pointer text-stone-900">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem className="cursor-pointer" value="available">Available</SelectItem>
                <SelectItem className="cursor-pointer" value="unavailable">Unavailable</SelectItem>
                <SelectItem className="cursor-pointer" value="discontinued">Discontinued</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" className="bg-red-700 hover:bg-red-600 cursor-pointer">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={loading} className="hover:bg-green-800 cursor-pointer">
            {loading ? "Saving…" : "Create Product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
