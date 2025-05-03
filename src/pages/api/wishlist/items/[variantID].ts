// pages/api/wishlist/items/[variantId].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import { prisma } from "../../../../../lib/prisma";
import { Role } from "@/generated/prisma";

type SuccessResp = { success: true };
type ErrorResp   = { success: false; error: string };

export default async function handler(req: NextApiRequest,res: NextApiResponse<SuccessResp | ErrorResp>) {
    if (req.method !== "DELETE") {
        res.setHeader("Allow", "DELETE");
        return res.status(405).json({ success: false, error: "Method Not Allowed" });
    }

    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id || session.user.role !== Role.customer) {
        return res.status(403).json({ success: false, error: "Forbidden" });
    }

    const variantId = typeof req.query.variantId === "string" ? req.query.variantId
                        : typeof req.query.variantID === "string" ? req.query.variantID:
                        undefined;

    if (typeof variantId !== "string") {
        return res.status(400).json({ success: false, error: "Invalid variant ID" });
    }

    const wishlist = await prisma.wishlist.findFirst({
        where: { user_id: session.user.id }
    });
    
    if (!wishlist) {
        return res.status(404).json({ success: false, error: "Wishlist not found" });
    }

    // find item in wishlist
    const item = await prisma.wishlistItem.findFirst({
        where: {
            wishlist_id: wishlist.wishlist_id,
            variant_id:  variantId
        }
    });

    if (!item) {
        return res.status(404).json({ success:false, error: "Item not in wishlist" });
    }

    // delete that single item
    await prisma.wishlistItem.delete({
        where: { wishlist_item_id: item.wishlist_item_id }
    });

    // if that was last item, delete  wishlist
    const remaining = await prisma.wishlistItem.count({
        where: { wishlist_id: wishlist.wishlist_id }
    });
    
    if (remaining === 0) {
        await prisma.wishlist.delete({ where: { wishlist_id: wishlist.wishlist_id } });
    }

    return res.status(200).json({ success: true });
}
