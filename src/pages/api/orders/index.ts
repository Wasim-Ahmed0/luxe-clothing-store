import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../../lib/prisma";
import { OrderDetail, Role } from "@/generated/prisma";


type OrderDetailItem = {
    variant_id: string
    quantity:   number
    price_at_purchase: number
}
  
type OrderRow = {
    order_id:     string
    created_at:   Date
    order_status: string
    total_amount: number
    details:      OrderDetailItem[]
}
  
type ListResp  = { success: true; orders: OrderRow[] }
type SuccessResp = { success: true; order_id: OrderDetail["order_id"]; checkoutToken: OrderDetail["order_id"];};
type ErrorResp = { success: false; error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<ListResp | SuccessResp | ErrorResp>) {
    if (req.method === "GET") {
        const session = await getServerSession(req, res, authOptions)
        if (!session?.user?.id || session.user.role !== Role.customer) {
            return res.status(401).json({ success: false, error: "Not Authenticated" })
        }

        const userID = session.user.id
    
        const orders = await prisma.order.findMany({
            where: { user_id: userID },
            orderBy: { created_at: "desc" },
            include: {
                details: {
                    select: {
                        variant_id: true,
                        quantity:   true,
                        price_at_purchase: true,
                    },
                },
            },
        })
    
        const out: OrderRow[] = orders.map((o) => ({
            order_id:     o.order_id,
            created_at:   o.created_at,
            order_status: o.order_status,
            total_amount: o.total_amount,
            details:      o.details.map((d) => ({
                variant_id: d.variant_id,
                quantity:   d.quantity,
                price_at_purchase: d.price_at_purchase,
            })),
        }))
    
        return res.status(200).json({ success: true, orders: out })        
    }

    if (req.method === "POST") {
        // Must be authenticated and a customer
        const session = await getServerSession(req, res, authOptions);
        if (!session?.user?.id || session.user.role !== Role.customer) {
            return res.status(401).json({ success: false, error: "Not Authenticated" });
        }

        const userID = session.user.id;

        // Validate payload
        const { cart_id } = req.body as { cart_id?: string };
        if (!cart_id) {
            return res.status(400).json({ success: false, error: "Missing cart_id" });
        }

        // Fetch the cart + items
        const cart = await prisma.virtualCart.findUnique({
            where: { cart_id },
            include: { items: true },
        });

        if (!cart) {
            return res.status(404).json({ success: false, error: "Cart not found" });
        }

        // Only allowing authenticated customer to pass through checkout
        if (cart.user_id !== userID) {
            return res.status(403).json({ success: false, error: "Forbidden" });
        }

        // Expiry Time Validation Check
        const now = new Date();
        if (cart.expires_at < now) {
            return res.status(400).json({ success: false, error: "Cart expired" });
        }

        // Keep store_id in scope of database transaction below
         const storeID = cart.store_id;

        // Run create-order and delete-cart in one transaction
        const result = await prisma.$transaction(async (tx) => {
            const total = cart.items.reduce((sum, i) => sum + i.quantity * i.price_at_time, 0);

            const order = await tx.order.create({
                data: {
                    user:        { connect: { user_id: cart.user_id! } },
                    store:       { connect: { store_id: cart.store_id } },
                    order_status:"pending",
                    total_amount: total,
                    details: {
                        create: cart.items.map(i => ({
                            variant:            { connect: { variant_id: i.variant_id } },
                            quantity:           i.quantity,
                            price_at_purchase:  i.price_at_time,
                        })),
                    },
                },
            });

            // Decrement inventory for each item
            for (const item of cart.items) {
                await tx.inventory.updateMany({
                    where: { store_id: storeID, variant_id: item.variant_id },
                    data:  { quantity: { decrement: item.quantity } },
                  });              
            }

            return order;
        });

        // Return a token (order_id)
        return res.status(201).json({success: true, order_id: result.order_id, checkoutToken: result.order_id,});
    }

    // 405 otherwise
    res.setHeader("Allow", "GET, POST")
    return res.status(405).json({ success: false, error: "Method Not Allowed" })
}

