// pages/api/orders/[orderID]/qr.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import { prisma } from "../../../../../lib/prisma";
import { Role, Order, OrderDetail, OrderStatus } from "@/generated/prisma";

type Item = {
    variant_id: OrderDetail["variant_id"];
    quantity: OrderDetail["quantity"];
    price_at_purchase: OrderDetail["price_at_purchase"];
};

type OrderResp = {
    order_id:       Order["order_id"];
    user_id:        Order["user_id"];
    store_id:       Order["store_id"];
    order_status:   OrderStatus;
    total_amount:   Order["total_amount"];
    created_at:     Order["created_at"];
    items:          Item[];
};

type SuccessResp = { success: true; order: OrderResp };
type ErrorResp = { success: false; error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<SuccessResp | ErrorResp>) {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return res.status(405).json({ success: false, error: "Method Not Allowed" });
    }

    const session = await getServerSession(req, res, authOptions);
    const { orderID, token } = req.query;
    
    if (typeof orderID !== "string" || typeof token !== "string") {
        return res.status(400).json({ success: false, error: "Invalid order ID or token" });
    }

    // token must match orderID
    if (token != orderID) {
        return res.status(403).json({ success: false, error: "Invalid token" });
    }

    // fetch order and items
    const order = await prisma.order.findUnique({
        where: { order_id: orderID },
        include: {
            details: {
                select: {
                    variant_id:       true,
                    quantity:         true,
                    price_at_purchase:true,
                },
            },
            store: { select: { store_id: true } },
        },
    });
    
    if (!order) {
        return res.status(404).json({ success: false, error: "Order not found" });
    }

    // only pending orders valid for checkout
    if (order.order_status !== OrderStatus.pending) {
        return res.status(409).json({ success:false, error: "Order not pending" });
    }

    const me = session?.user;
    const isOwner = me?.id === order.user_id;
    const isEmployee = me?.role === Role.employee || me?.role === Role.store_manager;
    
    if (!isOwner && !isEmployee) {
        return res.status(403).json({ success: false, error: "Forbidden" });
    }

    const resp: OrderResp = {
        order_id:       order.order_id,
        user_id:        order.user_id,
        store_id:       order.store.store_id,
        order_status:   order.order_status,
        total_amount:   order.total_amount,
        created_at:     order.created_at,
        items:          order.details.map((d) => ({
            variant_id:       d.variant_id,
            quantity:         d.quantity,
            price_at_purchase:d.price_at_purchase,
        })),
    };

    return res.status(200).json({ success: true, order: resp });
}
