import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import { prisma } from "../../../../../lib/prisma";
import { VirtualCart, RequestStatus } from "@/generated/prisma";

type Resp = { success: true; virtual_cart_id: VirtualCart["cart_id"] } | { success: false; error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Resp>) {
    const { fitCartID } = req.query;
    if (typeof fitCartID !== "string") {
        return res.status(400).json({ success: false, error: "Invalid cart ID" });
    }
    
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).json({ success: false, error: "Method Not Allowed" });
    }

    // load fitting room cart + its requests with their status
    const fitting = await prisma.fittingCart.findUnique({
        where: { fitting_cart_id: fitCartID },
        select: {
            fitting_cart_id: true,
            user_id:         true,
            store_id:        true,
            requests:        { select: { variant_id: true, status: true } },
          },
    });
    
    if (!fitting) {
        return res.status(404).json({ success: false, error: "Fitting cart not found" });
    }

    // Authenticate if cart.user_id exists, only that user can transfer
    const session = await getServerSession(req, res, authOptions);
    if (fitting.user_id && session?.user?.id !== fitting.user_id) {
        return res.status(403).json({ success: false, error: "Forbidden" });
    }

    // find / create the virtual cart
    const now    = new Date();
    const twoHrsLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    // try existing virtual cart
    let vCart = await prisma.virtualCart.findFirst({
        where: {
            store_id: fitting.store_id,
            user_id:  fitting.user_id ?? undefined,
            expires_at: { gt: now },
        },
    });

    // If existing cart then update, otherwise create
    if (vCart) {
        vCart = await prisma.virtualCart.update({
            where: { cart_id: vCart.cart_id },
            data: { expires_at: twoHrsLater },
        });
    } else {
        vCart = await prisma.virtualCart.create({
            data: {
                expires_at: twoHrsLater,
                store_id: fitting.store_id,
                ...(fitting.user_id ? { user_id: fitting.user_id } : {})
            }
        });
    }

    // Transfer requests that aren't cancelled + not already present in virtual cart
    const toTransfer = fitting.requests.filter(
        (r) => r.status !== RequestStatus.cancelled
    );

    await Promise.all(
        toTransfer.map(async ({ variant_id }) => {
            // skip if already in cart
            const alreadyInCart = await prisma.cartItem.findFirst({
                where: {
                    cart_id: vCart!.cart_id,
                    variant_id,
                },
            });

            if (alreadyInCart) return;

            // fetch price
            const variant = await prisma.productVariant.findUnique({
                where:  { variant_id },
                select: { product: { select: { price: true } } },
            });

            if (!variant) throw new Error("Variant not found");
    
            // create cart item
            await prisma.cartItem.create({
                data: {
                    cart_id: vCart!.cart_id,
                    variant_id,
                    quantity: 1,
                    price_at_time: variant.product.price,
                },
            });
        })
    );

    // return virtual cart id for frontend persistence
    return res.status(200).json({ success: true, virtual_cart_id: vCart.cart_id });
}
