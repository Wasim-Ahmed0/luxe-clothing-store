import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../../lib/prisma";
import { Role, StockStatus } from "@/generated/prisma";

type VariantLookupResp = {
  success: true
  product: {
    product_id: string
    name: string
    description: string
    price: number
    category: string
    variant: {
      variant_id: string
      size: string
      color: string
    }
  }
}
type ListResp = {
  success: true
  products: {
    product_id: string
    name: string
    description: string
    price: number
    category: string
  }[]
}

type CreatedResp = {
  success: true
  product: {
    product_id: string
    name: string
    description: string
    price: number
    category: string
    variant: {
      variant_id: string
      size: string
      color: string
      inventory: {
        inventory_id: string
        store_id: string
        quantity: number
        status: StockStatus
      }
    }
  }
}

type ErrorResp = { success: false; error: string }

export default async function handler(req: NextApiRequest, res: NextApiResponse<VariantLookupResp | ListResp | CreatedResp | ErrorResp>) {
  // GET handler
  if (req.method === "GET") {
    const { variantID, category, minPrice, maxPrice, color, sort, store_id, inStock } = req.query

    // single variant lookup
    if (typeof variantID === "string") {
      const variant = await prisma.productVariant.findUnique({
        where: { variant_id: variantID },
        include: { product: true },
      })
      if (!variant) {
        return res.status(404).json({ success: false, error: "Variant not found" })
      }
      const { product, size, color: vColor } = variant
      return res.status(200).json({
        success: true,
        product: {
          product_id: product.product_id,
          name:       product.name,
          description:product.description,
          price:      product.price,
          category:   product.category,
          variant: {
            variant_id: variant.variant_id,
            size,
            color: vColor,
          },
        },
      })
    }

    // list filters
    const filters: any = {}
    if (category) filters.category = category as string
    if (minPrice || maxPrice) {
      filters.price = {}
      if (minPrice) filters.price.gte = Number(minPrice)
      if (maxPrice) filters.price.lte = Number(maxPrice)
    }
    if (color) filters.variants = { some: { color: color as string } }

    // stock availability filter
    const wantInStock = inStock === "true"
    if (wantInStock && store_id) {
      filters.inventory = {
        some: {
          store_id: store_id as string,
          quantity: { gt: 0 },
          status: "available",
        },
      }
    } else if (store_id) {
      filters.inventory = { some: { store_id: store_id as string } }
    }

    // sorting
    let orderBy: any = {}
    if (sort === "price_asc") orderBy.price = "asc"
    else if (sort === "price_desc") orderBy.price = "desc"

    try {
      // fetch products list
      const products = await prisma.product.findMany({
        where: filters,
        orderBy: orderBy.price ? [orderBy] : undefined,
        select: {
          product_id: true,
          name:       true,
          description:true,
          price:      true,
          category:   true,
        },
      })
      return res.status(200).json({ success: true, products })
    } catch (err: any) {
      return res.status(500).json({ success: false, error: "Failed to fetch products" })
    }
  }

  // POST handler
  if (req.method === "POST") {
    // auth store_manager
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user?.id || session.user.role !== Role.store_manager) {
      return res.status(403).json({ success: false, error: "Forbidden" })
    }

    // manager's store
    const manager = await prisma.user.findUnique({
      where: { user_id: session.user.id },
      select: { store_id: true },
    })

    // extract + validate body
    const { name, description, price, category, size, color, quantity, status } = req.body as {
      name?: unknown
      description?: unknown
      price?: unknown
      category?: unknown
      size?: unknown
      color?: unknown
      quantity?: unknown
      status?: unknown
    }
    if (
      typeof name        !== "string" ||
      typeof description !== "string" ||
      typeof price       !== "number" || price < 0 ||
      typeof category    !== "string" ||
      typeof size        !== "string" ||
      typeof color       !== "string" ||
      typeof quantity    !== "number" ||
      !["available","unavailable","discontinued"].includes(status as string)
    ) {
      return res.status(400).json({ success: false, error: "Invalid input data" })
    }

    try {
      // create product, variant, inventory in one txn
      const { product, variant, inventory } = await prisma.$transaction(async (tx) => {
        const product = await tx.product.create({ data: { name, description, price, category } })
        const variant = await tx.productVariant.create({ data: { product_id: product.product_id, size, color } })
        const inventory = await tx.inventory.create({
          data: {
            store_id:    manager?.store_id!,
            product_id:  product.product_id,
            variant_id:  variant.variant_id,
            quantity,
            status:      status as StockStatus,
          },
        })
        return { product, variant, inventory }
      })

      // respond with created product + variant + inventory
      return res.status(201).json({
        success: true,
        product: {
          product_id:  product.product_id,
          name:        product.name,
          description: product.description,
          price:       product.price,
          category:    product.category,
          variant: {
            variant_id:   variant.variant_id,
            size:         variant.size,
            color:        variant.color,
            inventory: {
              inventory_id: inventory.inventory_id,
              store_id:     inventory.store_id,
              quantity:     inventory.quantity,
              status:       inventory.status,
            },
          },
        },
      })
    } catch (err: any) {
      console.error("Failed to create product:", err)
      return res.status(500).json({ success: false, error: "Database error" })
    }
  }

  // method not allowed
  res.setHeader("Allow", "GET, POST")
  return res.status(405).json({ success: false, error: "Method Not Allowed" })
}
