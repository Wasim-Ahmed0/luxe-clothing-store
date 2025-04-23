import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../../lib/prisma";
import { Product, Role } from "@/generated/prisma";

type ResponseData = { success: true; products: Product[] } | { success: true; productID: Product["product_id"]; } | { success: false; error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
    // Public Access 
    // === GET /api/products/ ===
    if (req.method === 'GET') {
        // Parse optional filters
        const { category, color, minPrice, maxPrice, sort } = req.query;
    
        const filters: any = {};
        if (category) {
            filters.category = category as string;
        }
        if (minPrice || maxPrice) {
            filters.price = {};
            if (minPrice) filters.price.gte = Number(minPrice);
            if (maxPrice) filters.price.lte = Number(maxPrice);
        }
        if (color) {
            filters.variants = {
                some: { color: color as string },
            };
        }

        // Building sort object (sort=price_asc) | (sort=price_desc)
        let orderBy: { price?: "asc" | "desc" } = {};
        if (sort === "price_asc") {
            orderBy.price = "asc";
        } else if (sort === "price_desc") {
            orderBy.price = "desc";
        }

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
        } catch (err:any) {
            return res.status(500).json({ success: false, error: "Failed to fetch products" });
        }
    }

    // Protected Access - Store Manager only
    // === POST /api/products/ ===
    if (req.method === 'POST') {
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
            return res.status(400).json({ success: false, error: "All product fields are required" });
        }

        try {
            const prdct = await prisma.product.create({
                data: { name, description, price, category },
            });
            return res.status(201).json({ success: true, productID: prdct.product_id });
        } catch (err: any) {
            return res.status(500).json({ success: false, error: "Failed to create product" });
        }
    }

    // 405 for all other methods
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
}