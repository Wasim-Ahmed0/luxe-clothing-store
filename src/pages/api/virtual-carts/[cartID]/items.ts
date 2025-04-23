import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import { prisma } from "../../../../../lib/prisma";
import { CartItem } from "@/generated/prisma";

type CartItemRow = {
    cart_item_id: CartItem["cart_item_id"];
    cart_id:      CartItem["cart_id"];
    variant_id:   CartItem["variant_id"];
    quantity: CartItem["quantity"];
    price_at_time: CartItem["price_at_time"];
};

type ResponseData = { success: true; item: CartItemRow } | { success: false; error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
    const { cartID } = req.query;
    if (typeof cartID !== "string") {
        return res.status(400).json({ success: false, error: "Invalid cart ID" });
    }

    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).json({ success: false, error: "Method Not Allowed" });
    }

    // Fetch cart + owner (if any)
    const cart = await prisma.virtualCart.findUnique({
        where: { cart_id: cartID },
        select: { cart_id: true, user_id: true },
    });
    if (!cart) {
        return res.status(404).json({ success: false, error: "Cart not found" });
    }

    // If cart already belongs to user , only they add items
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id || session.user.id !== cart.user_id) {
        return res.status(403).json({ success: false, error: "Forbidden" });
    }
    
    // Extract + validate payload
    const { variant_id, quantity } = req.body as {
        variant_id?: string;
        quantity?: number;
    };
    
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
                cart_id:      cartID,
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
