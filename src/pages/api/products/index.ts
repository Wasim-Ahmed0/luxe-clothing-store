import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "../../../../lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"

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
type ErrorResp = { success: false; error: string }

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<VariantLookupResp | ListResp | ErrorResp>
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET")
    return res.status(405).json({ success: false, error: "Method Not Allowed" })
  }

  const { variantID, category, minPrice, maxPrice, color, sort, store_id } =
    req.query

  // 1) If variantID passed, do a lookup and return single product+variant
  if (typeof variantID === "string") {
    const variant = await prisma.productVariant.findUnique({
      where: { variant_id: variantID },
      include: { product: true },
    })
    if (!variant) {
      return res
        .status(404)
        .json({ success: false, error: "Variant not found" })
    }

    // ← destructure the camel-cased field
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
          color:      vColor,
        },
      },
    })
  }

  // 2) Otherwise, fall back to list logic
  const filters: any = {}
  if (category) filters.category = category as string
  if (minPrice || maxPrice) {
    filters.price = {}
    if (minPrice) filters.price.gte = Number(minPrice)
    if (maxPrice) filters.price.lte = Number(maxPrice)
  }
  if (color) {
    filters.variants = { some: { color: color as string } }
  }
  if (store_id) {
    filters.inventory = { some: { store_id: store_id as string } }
  }

  let orderBy: any = {}
  if (sort === "price_asc") orderBy.price = "asc"
  else if (sort === "price_desc") orderBy.price = "desc"

  try {
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
    return res
      .status(500)
      .json({ success: false, error: "Failed to fetch products" })
  }
}
