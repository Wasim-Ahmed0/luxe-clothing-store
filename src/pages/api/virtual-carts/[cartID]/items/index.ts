import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]";
import { prisma } from "../../../../../../lib/prisma";
import { CartItem } from "@/generated/prisma";

type CartItemRow = {
    cart_item_id: CartItem["cart_item_id"];
    cart_id:      CartItem["cart_id"];
    variant_id:   CartItem["variant_id"];
    quantity:     CartItem["quantity"];
    price_at_time: CartItem["price_at_time"];
};

type ResponseData = { success: true; item?: CartItemRow } | { success: false; error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
    const { cartID } = req.query;
    // validate cartID
    if (typeof cartID !== "string") {
        return res.status(400).json({ success: false, error: "Invalid cart ID" });
    }

    // load cart and owner info
    const cart = await prisma.virtualCart.findUnique({
        where: { cart_id: cartID },
        select: { cart_id: true, user_id: true },
    });
    if (!cart) {
        return res.status(404).json({ success: false, error: "Cart not found" });
    }

    // determine guest vs owner
    const session = await getServerSession(req, res, authOptions);
    const isGuest = !cart.user_id;
    const isOwner = session?.user?.id === cart.user_id;

    // ADD ITEM
    if (req.method === "POST") {
        // auth check
        if (!isGuest && !isOwner) {
            return res.status(403).json({ success: false, error: "Forbidden" });
        }

        // extract + validate payload
        const { variant_id, quantity } = req.body as {
            variant_id?: string;
            quantity?: number;
        };
        if (!variant_id || !quantity || quantity < 1) {
            return res.status(400).json({ success: false, error: "variant_id & quantity>=1 required" });
        }

        // fetch current price
        const variant = await prisma.productVariant.findUnique({
            where: { variant_id },
            include: { product: { select: { price: true } } }
        });
        if (!variant) {
            return res.status(404).json({ success: false, error: "Variant not found" });
        }

        try {
            // create cart item record
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
        } catch {
            return res.status(500).json({ success: false, error: "Failed to add item" });
        }
    }

    // DELETE ITEM
    if (req.method === "DELETE") {
        // auth check
        if (!isGuest && !isOwner) {
            return res.status(403).json({ success: false, error: "Forbidden" });
        }

        // extract + validate item ID
        const { cart_item_id } = req.body as { cart_item_id?: string };
        if (!cart_item_id) {
            return res.status(400).json({ success: false, error: "cart_item_id is required" });
        }

        // verify ownership of item
        const existing = await prisma.cartItem.findUnique({
            where: { cart_item_id },
            select: { cart_id: true },
        });
        if (!existing || existing.cart_id !== cartID) {
            return res.status(404).json({ success: false, error: "Item not found" });
        }

        try {
            // remove item
            await prisma.cartItem.delete({ where: { cart_item_id } });

            // if cart empty, delete cart
            const remaining = await prisma.cartItem.count({ where: { cart_id: cartID } });
            if (remaining === 0) {
                await prisma.virtualCart.delete({ where: { cart_id: cartID } });
            }
            return res.status(200).json({ success: true });
        } catch {
            return res.status(500).json({ success: false, error: "Failed to delete item" });
        }
    }

    // method not supported
    res.setHeader("Allow", "POST, DELETE");
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
}
