import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../../lib/prisma";
import { VirtualCart, CartItem, ProductVariant, Product } from "@/generated/prisma";

type CartItemResp = {
    cart_item_id: CartItem["cart_item_id"];
    quantity: CartItem["quantity"];
    price_at_time: CartItem["price_at_time"];
    variant: {
        variant_id: ProductVariant["variant_id"];
        size: ProductVariant["size"];
        color: ProductVariant["color"];
        product: {
            product_id: Product["product_id"];
            name: Product["name"];
            price: Product["price"];
        };
    };
};

type SuccessResp = {
    success: true;
    cart: {
        cart_id: VirtualCart["cart_id"];
        store_id: VirtualCart["store_id"];
        created_at: VirtualCart["created_at"];
        expires_at: VirtualCart["expires_at"];
        items: CartItemResp[];
    };
};

type ErrorResp = { success: false; error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<SuccessResp | ErrorResp>) {
    // only GET allowed
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return res.status(405).json({ success: false, error: "Method Not Allowed" });
    }

    // optionally load session
    const session = await getServerSession(req, res, authOptions);
    
    // validate cartID param
    const cartID = req.query.cartID;
    if (typeof cartID !== "string") {
        return res.status(400).json({ success: false, error: "Invalid Cart ID" });
    }

    try {
        // fetch cart with nested items, variants, and products
        const cart = await prisma.virtualCart.findUnique({
            where: { cart_id: cartID },
            include: {
                items: {
                    select: {
                        cart_item_id: true,
                        quantity: true,
                        price_at_time: true,
                        variant: {
                            select: {
                                variant_id: true,
                                size: true,
                                color: true,
                                product: {
                                    select: {
                                        product_id: true,
                                        name: true,
                                        price: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        // cart not found
        if (!cart) {
            return res.status(404).json({ success: false, error: "Cart not found" });
        }

        // auth check for user-owned carts
        if (cart.user_id) {
            if (!session?.user?.id || session.user.id !== cart.user_id) {
                return res.status(403).json({ success: false, error: "Forbidden" });
            }
        }
        
        // shape and return response
        const resp: SuccessResp = {
            success: true,
            cart: {
                cart_id: cart.cart_id,
                store_id: cart.store_id,
                created_at: cart.created_at,
                expires_at: cart.expires_at,
                items: cart.items.map((i) => ({
                    cart_item_id: i.cart_item_id,
                    quantity: i.quantity,
                    price_at_time: i.price_at_time,
                    variant: {
                        variant_id: i.variant.variant_id,
                        size: i.variant.size,
                        color: i.variant.color,
                        product: {
                            product_id: i.variant.product.product_id,
                            name: i.variant.product.name,
                            price: i.variant.product.price,
                        },
                    },
                })),
            },
        };
        return res.status(200).json(resp);
    } catch (err: any) {
        // unexpected error
        return res.status(500).json({ success: false, error: "Failed to fetch cart" });
    }
}
