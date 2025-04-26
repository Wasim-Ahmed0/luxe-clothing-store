import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../../lib/prisma";
import { Role } from "@/generated/prisma";

type Item = {
    wishlist_item_id: string;
    variant_id:       string;
    size:             string;
    color:            string;
    product_name:     string;
    price:            number;
};

type SuccessResp = { success: true; items: Item[] };
type ErrorResp   = { success: false; error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<SuccessResp | ErrorResp>) {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return res.status(405).json({ success: false, error: "Method Not Allowed" });
    }

    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id || session.user.role !== Role.customer) {
        return res.status(403).json({ success: false, error: "Forbidden" });
    }

    const wishlist = await prisma.wishlist.findFirst({
        where: { user_id: session.user.id },
        include: {
            items: {
                include: {
                    variant: {
                        include: { product: true }
                    }
                }
            }
        }
    });

    const items: Item[] = wishlist
        ? wishlist.items.map((wi) => ({
            wishlist_item_id: wi.wishlist_item_id,
            variant_id:       wi.variant_id,
            size:             wi.variant.size,
            color:            wi.variant.color,
            product_name:     wi.variant.product.name,
            price:            wi.variant.product.price,
        }))
        : [];

    return res.status(200).json({ success: true, items });
}
