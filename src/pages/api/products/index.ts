// pages/api/products/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../../lib/prisma";
import { Product, ProductVariant, Role } from "@/generated/prisma";

type ListResp = { success: true; products: Product[] };
type LookupResp = {
  success: true;
  variant: {
    variant_id: ProductVariant["variant_id"];
    size: string;
    color: string;
    product: {
      product_id: Product["product_id"];
      name: string;
      description: string;
      price: number;
      category: string;
    };
  };
};
type CreateResp = { success: true; productID: Product["product_id"] };
type ErrorResp = { success: false; error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ListResp | LookupResp | CreateResp | ErrorResp>
) {
  // === GET /api/products?variant_id=...  ===
  if (req.method === "GET" && req.query.variant_id) {
    const vid = req.query.variant_id as string;
    try {
      const variant = await prisma.productVariant.findUnique({
        where: { variant_id: vid },
        include: {
          product: {
            select: {
              product_id: true,
              name: true,
              description: true,
              price: true,
              category: true,
            },
          },
        },
      });
      if (!variant) {
        return res
          .status(404)
          .json({ success: false, error: "Variant not found" });
      }
      return res.status(200).json({
        success: true,
        variant: {
          variant_id: variant.variant_id,
          size: variant.size,
          color: variant.color,
          product: variant.product,
        },
      });
    } catch (err: any) {
      return res
        .status(500)
        .json({ success: false, error: "Failed to fetch variant" });
    }
  }

  // === GET /api/products ===
  if (req.method === "GET") {
    const { category, color, minPrice, maxPrice, sort, store_id } = req.query;
    const filters: any = {};
    if (category) filters.category = category as string;
    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.gte = Number(minPrice);
      if (maxPrice) filters.price.lte = Number(maxPrice);
    }
    if (color) {
      filters.variants = { some: { color: color as string } };
    }
    if (store_id) {
      filters.inventory = { some: { store_id: store_id as string } };
    }
    let orderBy: { price?: "asc" | "desc" } = {};
    if (sort === "price_asc") orderBy.price = "asc";
    else if (sort === "price_desc") orderBy.price = "desc";

    try {
      const products = await prisma.product.findMany({
        where: filters,
        orderBy: orderBy.price ? [orderBy] : undefined,
        select: {
          product_id: true,
          name: true,
          description: true,
          price: true,
          category: true,
        },
      });
      return res.status(200).json({ success: true, products });
    } catch (err: any) {
      return res
        .status(500)
        .json({ success: false, error: "Failed to fetch products" });
    }
  }

  // === POST /api/products ===  (store manager only)
  if (req.method === "POST") {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.role || session.user.role !== Role.store_manager) {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }
    const { name, description, price, category } = req.body as {
      name?: string;
      description?: string;
      price?: number;
      category?: string;
    };
    if (!name || !description || price == null || !category) {
      return res
        .status(400)
        .json({ success: false, error: "All product fields are required" });
    }
    try {
      const prdct = await prisma.product.create({
        data: { name, description, price, category },
      });
      return res.status(201).json({ success: true, productID: prdct.product_id });
    } catch (err: any) {
      return res
        .status(500)
        .json({ success: false, error: "Failed to create product" });
    }
  }

  // 405 for everything else
  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ success: false, error: "Method Not Allowed" });
}
