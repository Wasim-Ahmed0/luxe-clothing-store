// pages/api/wishlist/items.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../../lib/prisma";
import { Role } from "@/generated/prisma";

type SuccessResp = { success: true; wishlist_item_id: string };
type ErrorResp   = { success: false; error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<SuccessResp | ErrorResp>) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).json({ success: false, error: "Method Not Allowed" });
    }

    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
        return res.status(403).json({ success: false, error: "Forbidden" });
    }

    const { variant_id } = req.body as { variant_id?: string };
    if (typeof variant_id !== "string") {
        return res.status(400).json({ success: false, error: "Missing variant_id" });
    }

    // ensure variant exists
    const variant = await prisma.productVariant.findUnique({ where: { variant_id } });
    if (!variant) {
        return res.status(404).json({ success: false, error: "Variant not found" });
    }

    // find or create wishlist
    let wishlist = await prisma.wishlist.findFirst({ where: { user_id: session.user.id } });
    if (!wishlist) {
        wishlist = await prisma.wishlist.create({
            data: { user_id: session.user.id }
        });
    }

    // avoid duplicates
    const existing = await prisma.wishlistItem.findFirst({
        where: { wishlist_id: wishlist.wishlist_id, variant_id }
    });
    
    if (existing) {
        return res.status(200).json({ success: true, wishlist_item_id: existing.wishlist_item_id });
    }

    // add item
    const wi = await prisma.wishlistItem.create({
        data: {
            wishlist_id: wishlist.wishlist_id,
            variant_id,
        }
    });

    return res.status(201).json({ success: true, wishlist_item_id: wi.wishlist_item_id });
}
