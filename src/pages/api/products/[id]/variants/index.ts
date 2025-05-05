import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]";
import { prisma } from "../../../../../../lib/prisma";
import { Role, StockStatus } from "@/generated/prisma";

type CreatedResp = {
    success: true;
    variant: {
        variant_id: string;
        size: string;
        color: string;
        inventory: {
            inventory_id: string;
            store_id: string;
            product_id: string;
            variant_id: string;
            quantity: number;
            status: StockStatus;
            last_updated: string;
        };
    };
};

type ErrorResp = { success: false; error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<CreatedResp | ErrorResp>) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).json({ success: false, error: "Method Not Allowed" });
    }

    // only store managers can add new variants
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id || session.user.role !== Role.store_manager) {
        return res.status(403).json({ success: false, error: "Forbidden" });
    }

    const productId = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
    if (!productId) {
        return res.status(400).json({ success: false, error: "Missing product ID" });
    }

    const { size: rawSize, color: rawColor, quantity: rawQty, status: rawStatus} = req.body as { size?: unknown; color?: unknown; quantity?: unknown; status?: unknown};

    if (
        typeof rawSize !== "string" ||
        typeof rawColor !== "string" ||
        typeof rawQty !== "number" ||
        rawQty < 0 || !["available", "unavailable", "discontinued"].includes(rawStatus as string)
    ) {
        return res.status(400).json({ success: false, error: "Invalid input data" });
    }

    const size = rawSize;
    const color = rawColor;
    const quantity = rawQty;
    const status = rawStatus as StockStatus;

    // get the manager's store_id
    const manager = await prisma.user.findUnique({
        where: { user_id: session.user.id },
        select: { store_id: true },
    });

    try {
        const { variant, inventory } = await prisma.$transaction(async (tx) => {
            const variant = await tx.productVariant.create({
                data: {
                    product_id: productId,
                    size,
                    color,
                },
            });
            const inventory = await tx.inventory.create({
                data: {
                    store_id: manager?.store_id!,
                    product_id: productId,
                    variant_id: variant.variant_id,
                    quantity,
                    status,
                },
            });
            return { variant, inventory };
        });

        return res.status(201).json({
            success: true,
            variant: {
                variant_id: variant.variant_id,
                size: variant.size,
                color: variant.color,
                inventory: {
                    inventory_id: inventory.inventory_id,
                    store_id: inventory.store_id,
                    product_id: inventory.product_id,
                    variant_id: inventory.variant_id,
                    quantity: inventory.quantity,
                    status: inventory.status,
                    last_updated: inventory.last_updated.toISOString(),
                },
            },
        });
    } catch (err: any) {
        console.error("Failed to create variant + inventory:", err);
        return res.status(500).json({ success: false, error: "Database error" });
    }
}
