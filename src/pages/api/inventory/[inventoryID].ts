import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../../lib/prisma";
import { Inventory, Role } from "@/generated/prisma";

type InventoryRow = {
    inventory_id: Inventory["inventory_id"];
    store_id:     Inventory["store_id"];
    product_id:   Inventory["product_id"];
    variant_id:   Inventory["variant_id"];
    quantity:     Inventory["quantity"];
    status:       Inventory["status"];
    last_updated: Inventory["last_updated"];
  };

type ResponseData = { success: true; row: InventoryRow } | { success: false; error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
    const { inventoryID } = req.query;
    if (typeof inventoryID !== "string") {
        return res.status(400).json({ success: false, error: "Invalid inventoryId" });
    }

    // Protectded endpoint
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.role || session.user.role !== Role.store_manager) {
        return res.status(403).json({ success: false, error: "Forbidden" });
    }

    // --- GET a single inventory row ---
    if (req.method === "GET") {
        try {
            const row = await prisma.inventory.findUnique({
                where: { inventory_id: inventoryID },
                select: {
                    inventory_id: true,
                    store_id:     true,
                    product_id:   true,
                    variant_id:   true,
                    quantity:     true,
                    status:       true,
                    last_updated: true,
                },
            });
            if (!row) {
                return res.status(404).json({ success: false, error: "Not found" });
            }
            return res.status(200).json({ success: true, row });
        } catch (err: any) {
            return res.status(500).json({ success: false, error: "Fetch failed" });
        }
    }

    // --- PUT to update quantity or status ---
    if (req.method === "PUT") {
        // Extract Payload
        const { quantity, status } = req.body as {
            quantity?: number;
            status?:   "available" | "unavailable" | "discontinued";
        };
        
        // Validate Payload
        if (quantity == null && status == null) {
            return res.status(400).json({ success: false, error: "Provide quantity or status" });
        }

        // Update Inventory Record
        try {
            const updated = await prisma.inventory.update({
                where: { inventory_id: inventoryID },
                data: {
                    ...(quantity != null ? { quantity } : {}),
                    ...(status   != null ? { status }   : {}),
                },
                select: {
                    inventory_id: true,
                    store_id:     true,
                    product_id:   true,
                    variant_id:   true,
                    quantity:     true,
                    status:       true,
                    last_updated: true,
                },
            });
            return res.status(200).json({ success: true, row: updated });
        } catch (err: any) {
            return res.status(500).json({ success: false, error: "Update failed" });
        }
    }

    // fallthrough
    res.setHeader("Allow", "GET, PUT");
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
}
