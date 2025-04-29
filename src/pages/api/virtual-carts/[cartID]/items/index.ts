import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]";
import { prisma } from "../../../../../../lib/prisma";
import { CartItem } from "@/generated/prisma";

type CartItemRow = {
    cart_item_id: CartItem["cart_item_id"];
    cart_id:      CartItem["cart_id"];
    variant_id:   CartItem["variant_id"];
    quantity: CartItem["quantity"];
    price_at_time: CartItem["price_at_time"];
};

type ResponseData = { success: true; item?: CartItemRow } | { success: false; error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
    const { cartID } = req.query;
    if (typeof cartID !== "string") {
        return res.status(400).json({ success: false, error: "Invalid cart ID" });
    }

    // Fetch cart + owner (if any)
    const cart = await prisma.virtualCart.findUnique({
        where: { cart_id: cartID },
        select: { cart_id: true, user_id: true },
    });
    if (!cart) {
        return res.status(404).json({ success: false, error: "Cart not found" });
    }

    // Check if a guest cart or an owned cart
    const session = await getServerSession(req, res, authOptions);
    const isGuest = !cart.user_id;
    const isOwner = session?.user?.id === cart.user_id;

    // POST - Add item to cart
    if (req.method === "POST") {
        if (!isGuest && !isOwner) {
            return res.status(403).json({ success: false, error: "Forbidden" });
        }

        // Extract payload
        const { variant_id, quantity } = req.body as {
            variant_id?: string;
            quantity?: number;
        };

        // Validate payload
        if (!variant_id || !quantity || quantity < 1) {
            return res.status(400).json({ success: false, error: "variant_id & quantity>=1 required" });
        }

        // Lookup price at time
        const variant = await prisma.productVariant.findUnique({
            where: { variant_id },
            include: { product: { select: { price: true } } }
        });
        
        if (!variant) {
            return res.status(404).json({ success: false, error: "Variant not found" });
        }

        try {
            // Create the cart item
            const item = await prisma.cartItem.create({
                data: {
                    cart_id:       cartID,
                    variant_id,
                    quantity,
                    price_at_time: variant.product.price,
                },
                select: {
                    cart_item_id: true,
                    cart_id:      true,
                    variant_id:   true,
                    quantity:     true,
                    price_at_time:true
                }
            });
        
            return res.status(201).json({ success: true, item });
        } catch (err: any) {
            return res.status(500).json({ success: false, error: "Failed to add item" });
        }
    }

    // DELETE: remove an item
    if (req.method === "DELETE") {
        // Only the cart owner can remove; guests can remove from their own guest cart
        if (!isGuest && !isOwner) {
            return res.status(403).json({ success: false, error: "Forbidden" });
        }

        const { cart_item_id } = req.body as { cart_item_id?: string };
        if (!cart_item_id) {
            return res.status(400).json({ success: false, error: "cart_item_id is required" });
        }

        // Ensure the item actually belongs to this cart
        const existing = await prisma.cartItem.findUnique({
            where: { cart_item_id },
            select: { cart_id: true },
        });
        
        if (!existing || existing.cart_id !== cartID) {
            return res.status(404).json({ success: false, error: "Item not found" });
        }

        try {
            // Delete the item
            await prisma.cartItem.delete({ where: { cart_item_id } });

            // Auto delete empty cart
            const remaining = await prisma.cartItem.count({
                where: { cart_id: cartID },
            });
      
            if (remaining === 0) {
                await prisma.virtualCart.delete({ where: { cart_id: cartID } });
            }

            return res.status(200).json({ success: true });
        } catch (err: any) {
            return res.status(500).json({ success: false, error: "Failed to delete item" });
    }
  }
}
