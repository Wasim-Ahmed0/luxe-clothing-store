import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../../lib/prisma";
import { CartItem, ProductVariant, Product, Role } from "@/generated/prisma";

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
    cart_id: string;
    store_id: string;
    created_at: string;
    expires_at: string;
    items: CartItemResp[];
  };
};

type ErrorResp = { success: false; error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuccessResp | ErrorResp>
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  // 1) Authenticate
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ success: false, error: "Not Authenticated" });
  }

  const cartId = req.query.id;
  if (typeof cartId !== "string") {
    return res.status(400).json({ success: false, error: "Invalid Cart ID" });
  }

  // 2) Fetch cart + items + variant + product info
  try {
    const cart = await prisma.virtualCart.findUnique({
      where: { cart_id: cartId },
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

    if (!cart) {
      return res.status(404).json({ success: false, error: "Cart not found" });
    }

    // 3) Authorise: only owner
    if (cart.user_id !== session.user.id) {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }

    // 4) Return
    const resp: SuccessResp = {
      success: true,
      cart: {
        cart_id: cart.cart_id,
        store_id: cart.store_id,
        created_at: cart.created_at.toISOString(),
        expires_at: cart.expires_at.toISOString(),
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
    console.error(err);
    return res.status(500).json({ success: false, error: "Failed to fetch cart" });
  }
}
