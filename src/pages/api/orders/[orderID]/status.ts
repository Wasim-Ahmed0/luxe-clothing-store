import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import { prisma } from "../../../../../lib/prisma";
import { Role, Order, OrderStatus } from "@/generated/prisma";

type SuccessResp = { success: true; order_id: Order["order_id"]; status: OrderStatus };
type ErrorResp = { success: false; error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<SuccessResp | ErrorResp>) {
    if (req.method !== "PUT") {
        res.setHeader("Allow", "PUT");
        return res.status(405).json({ success: false, error: "Method Not Allowed" });
    }

    const session = await getServerSession(req, res, authOptions);
    const me = session?.user;
    if (!me) {
        return res.status(401).json({ success: false, error: "Not Authenticated" });
    }

    const { orderID } = req.query;
    if (typeof orderID !== "string") {
        return res.status(400).json({ success: false, error: "Invalid order ID" });
    }

    const { status, cart_id, store_id } = req.body as { status?: OrderStatus; cart_id?: string; store_id?: string };
    if (
        status !== "pending" &&
        status !== "completed" &&
        status !== "cancelled"
    ) {
        return res.status(400).json({ success: false, error: "Invalid status" });
    }

    // Load existing order
    const order = await prisma.order.findUnique({
        where: { order_id: orderID },
        select: { order_id: true, user_id: true },
    });
    
    if (!order) {
        return res.status(404).json({ success: false, error: "Order not found" });
    }
    
    // load default store ID from env
    const defaultStore = process.env.NEXT_PUBLIC_DEFAULT_STORE_ID;


    if (status === "completed") {
        // if not online store, require staff authentication
        console.log(defaultStore)
        console.log(store_id)
        if (store_id !== defaultStore) {
            if (me.role !== Role.employee && me.role !== Role.store_manager) {
                return res.status(403).json({ success: false, error: "Forbidden" });
            }
        }
        // else, its the online store so no need for auth
    } else if (status === "cancelled") {
        if (order.user_id !== me.id) {
            return res.status(403).json({ success: false, error: "Forbidden" });
        }
    } else {
        // dissallow re-setting back to pending status
        return res.status(400).json({ success: false, error: "Cannot set to pending" });
    }

    // Perform update
    const updated = await prisma.order.update({
        where: { order_id: orderID },
        data: { order_status: status },
    });

    if (status === "completed" && cart_id) {
        try {
          await prisma.virtualCart.delete({ where: { cart_id } });
        } catch (e) {
          console.error("Failed to delete cart:", e);
        }
      }    

    return res.status(200).json({ success: true, order_id: updated.order_id, status: updated.order_status });
}
