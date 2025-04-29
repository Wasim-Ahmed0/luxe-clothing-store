import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]";
import { prisma } from "../../../../../../lib/prisma";
import { CartItem } from "@/generated/prisma";

type CartItemRow = {
    cart_item_id:   CartItem["cart_item_id"];
    cart_id:        CartItem["cart_id"];
    variant_id:     CartItem["variant_id"];
    quantity:       CartItem["quantity"];
    price_at_time:  CartItem["price_at_time"];
};

type ResponseData = { success: true; item: CartItemRow } | { success: false; error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
    const { cartID, itemID } = req.query;
    if (typeof cartID !== "string" || typeof itemID !== "string") {
        return res.status(400).json({ success: false, error: "Invalid IDs" });
    }

    if (req.method !== "PUT") {
        res.setHeader("Allow", "PUT");
        return res.status(405).json({ success: false, error: "Method Not Allowed" });
    }

    // Load the cartItem and its cart owner
    const cartItem = await prisma.cartItem.findUnique({
        where: { cart_item_id: itemID },
        select: {
            cart_item_id: true,
            cart_id:      true,
            quantity:     true,
            price_at_time:true,
            variant_id:   true,
            cart: { select: { user_id: true } },
        },
    });
    
    if (!cartItem) {
        return res.status(404).json({ success: false, error: "Item not found" });
    }

    // Authentication - determine if guest or customer
    const ownerId = cartItem.cart.user_id;
    if (ownerId) {
        const session = await getServerSession(req, res, authOptions);
        if (!session?.user?.id || session.user.id !== ownerId) {
            return res.status(403).json({ success: false, error: "Forbidden" });
        }
    }
    
    // if ownerId is null -> guest cart -> anyone with the cartID may update!!!

    // Extract payload
    const { quantity } = req.body as { quantity?: number };
    if (!quantity || quantity < 1) {
        return res.status(400).json({ success: false, error: "Quantity must be ≥ 1" });
    }

    // Perform update
    try {
        const updated = await prisma.cartItem.update({
            where: { cart_item_id: itemID },
            data: { quantity },
            select: {
                cart_item_id: true,
                cart_id:      true,
                variant_id:   true,
                quantity:     true,
                price_at_time:true,
            },
        });
        
        return res.status(200).json({ success: true, item: updated });
    } catch (err: any) {
        return res.status(500).json({ success: false, error: "Failed to update cart item" });
    }
}
