import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../../lib/prisma";
import { VirtualCart, Role } from "@/generated/prisma";

type CartRow = {
    cart_id:      VirtualCart["cart_id"];
    user_id:      VirtualCart["user_id"];
    store_id:     VirtualCart["store_id"];
    created_at:   VirtualCart["created_at"];
    expires_at:   VirtualCart["expires_at"];
}

type ResponseData = { success: true; cart: CartRow } | { success: false; error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
    // Only accept POST requests
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return res.status(405).json({ success: false, error: "Method Not Allowed" });
    }

    // Authenticate as customer (or guest)
    let userID: string | null = null;
    const session = await getServerSession(req, res, authOptions);
    if (session?.user?.id && session.user.role === Role.customer) {
        userID = session.user.id;
    }
    
    // Validate and check store_id
    const { store_id } = req.body as { store_id?: string };
    if (!store_id) {
        return res.status(400).json({ success: false, error: "Missing store_id" });
    }
    const store = await prisma.store.findUnique({ where: { store_id } });
    if (!store) {
        return res.status(404).json({ success: false, error: "Store Not Found" });
    }

    // Compute 2-hour expiration
    const now = new Date();
    const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    let cart;

    // Attempt to find existing non-expired cart for authenticated user
    if (userID) {
        cart = await prisma.virtualCart.findFirst({
            where: {
                user_id: userID,
                store_id: store_id,
                expires_at: { gt: now },
            }
        });
    }

    // Create new cart if none found (guest or user)
    if (!cart) {
        cart = await prisma.virtualCart.create({
            data: {
                // link user if available
                ...(userID ? { user: { connect: { user_id: userID } } } : {}),
                // always link store
                store: { connect: { store_id } },
                expires_at: twoHoursLater,
            },
        });
    }

    // Respond with cart details
    return res.status(201).json({
        success: true,
        cart: {
            cart_id:    cart.cart_id,
            user_id:    cart.user_id,
            store_id:   cart.store_id,
            created_at: cart.created_at,
            expires_at: cart.expires_at,
        },
    });
}
