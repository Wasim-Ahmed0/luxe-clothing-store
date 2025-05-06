import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import { prisma } from "../../../../../lib/prisma";
import { FittingRoomRequest } from "@/generated/prisma";

type Resp = { success: true; request_id: FittingRoomRequest["request_id"] } | { success: false; error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Resp>) {
    // validate cart ID in query
    const { fitCartID } = req.query;
    if (typeof fitCartID !== "string") {
        return res.status(400).json({ success: false, error: "Invalid cart ID" });
    }

    // only allow POST
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).json({ success: false, error: "Method Not Allowed" });
    }

    // fetch fitting cart record
    const cart = await prisma.fittingCart.findUnique({
        where: { fitting_cart_id: fitCartID },
        select: { fitting_cart_id: true, user_id: true, store_id: true },
    });
    if (!cart) {
        return res.status(404).json({ success: false, error: "Fitting cart not found" });
    }

    // authorize user if cart is linked
    const session = await getServerSession(req, res, authOptions);
    if (cart.user_id && session?.user?.id !== cart.user_id) {
        return res.status(403).json({ success: false, error: "Forbidden" });
    }

    // extract and validate payload
    const { fitting_room_id, variant_id } = req.body as {
        fitting_room_id?: string;
        variant_id?: string;
    };
    if (!variant_id) {
        return res.status(400).json({ success: false, error: "variant_id is required" });
    }

    // create new try-on request
    try {
        const fr = await prisma.fittingRoomRequest.create({
            data: {
                fitting_cart_id: fitCartID,
                store_id: cart.store_id,
                ...(cart.user_id ? { user_id: cart.user_id } : {}), // attach user if exists
                fitting_room_id,
                variant_id,
            },
        });
        return res.status(201).json({ success: true, request_id: fr.request_id });
    } catch (err: any) {
        return res.status(500).json({ success: false, error: "Failed to create request" });
    }
}
