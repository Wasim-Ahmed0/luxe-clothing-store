import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import { ProductVariant, Product, Role } from "@/generated/prisma";

type Variant   = { variant_id: ProductVariant["variant_id"]; size: ProductVariant["size"]; color: ProductVariant["color"] };
type ProductDetail = {
    product_id: Product["product_id"];
    name: Product["name"];
    description: Product["description"];
    price: Product["price"];
    category: Product["category"];
    variants: Variant[];
};

type ResponseData = 
    { success: true; product: ProductDetail } 
    | { size?: ProductVariant["size"]; color: ProductVariant["color"] }
    | { success: true; variant: Variant }
    | { success: false; error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
    const { id } = req.query;
    if (typeof id !== "string") {
        return res.status(400).json({ success: false, error: "Invalid Product ID" });
    }

    // Public Access 
    // === GET /api/products/{id} ===
    if (req.method === 'GET') {
        try {
            const product = await prisma.product.findUnique({
                where: { product_id: id },
                include: {
                    variants: {
                        select: { variant_id: true, size: true, color: true },
                    },
                },
            });
    
            if (!product) {
                return res.status(404).json({ success: false, error: "Product Not Found" });
            }
    
            return res.status(200).json({
                success: true,
                product: {
                    product_id: product.product_id,
                    name: product.name,
                    description: product.description,
                    price: product.price,
                    category: product.category,
                    variants: product.variants,
                },
            });
        } catch (err: any) {
            console.error(err);
            return res.status(500).json({ success: false, error: "Failed to fetch the product" });
        }
    }

    // Protected Access - Store Manager only
    // === POST /api/products/{id} ===
    if (req.method === 'POST') {
        const session = await getServerSession(req, res, authOptions);
        if (!session?.user?.id || session.user.role !== Role.store_manager) {
            return res.status(403).json({ success: false, error: "Forbidden" });
        }

        const { size, color } = req.body as {
            size?: string;
            color?: string;
        }
        
        if (!size || !color) {
            return res.status(400).json({ success: false, error: "Size and color are required" });
        }

        try {
            const variant = await prisma.productVariant.create({
              data: {
                product: { connect: { product_id: id } },
                size,
                color,
              },
              select: { variant_id: true, size: true, color: true },
            });
            return res.status(201).json({ success: true, variant });
          } catch (err: any) {
            return res.status(500).json({ success: false, error: "Failed to create variant" });
          }
    }

    // === PUT /api/products/{id} (manager only) ===
    if (req.method === "PUT") {
        const session = await getServerSession(req, res, authOptions);
        if (!session?.user?.id || session.user.role !== Role.store_manager) {
            return res.status(403).json({ success: false, error: "Forbidden" });
        }

        const { name, description, price, category } = req.body as {
            name?: string;
            description?: string;
            price?: number;
            category?: string;
        };

        // Must supply at least one field to update
        if (name == null && description == null && price == null && category == null) {
            return res.status(400).json({ success: false, error: "At least one field is required to update" });
        }

        try {
            const updated = await prisma.product.update({
                where: { product_id: id },
                data: {
                    ...(name        != null ? { name }        : {}),
                    ...(description != null ? { description } : {}),
                    ...(price       != null ? { price }       : {}),
                    ...(category    != null ? { category }    : {}),
                },
                include: {
                    variants: { select: { variant_id: true, size: true, color: true } },
                },
            });

            return res.status(200).json({
                success: true,
                product: {
                    product_id:   updated.product_id,
                    name:         updated.name,
                    description:  updated.description,
                    price:        updated.price,
                    category:     updated.category,
                    variants:     updated.variants,
                },
            });
        } catch (err: any) {
            return res.status(500).json({ success: false, error: "Failed to update product" });
        }
    }

    // 405 for all other methods
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
    
}
