import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../../lib/prisma";
import { OrderDetail, Order, Role } from "@/generated/prisma";

type Item = {
  variant_id:        OrderDetail["variant_id"];
  quantity:          OrderDetail["quantity"];
  price_at_purchase: OrderDetail["price_at_purchase"];
};

type SuccessResp = {
  success: true;
  order: {
    order_id:     Order["order_id"];
    store_id:     Order["store_id"];
    user_id:      Order["user_id"];
    status:       Order["order_status"];
    total_amount: Order["total_amount"];
    created_at:   Order["created_at"];
    details:      Item[];
  };
};

type ErrorResp = { success: false; error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<SuccessResp | ErrorResp>) {
  // only allow GET
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  // attempt session load
  const session = await getServerSession(req, res, authOptions);

  // validate orderID param
  const { orderID } = req.query;
  if (typeof orderID !== "string") {
    return res.status(400).json({ success: false, error: "Invalid order ID" });
  }

  // fetch order + its details
  const order = await prisma.order.findUnique({
    where: { order_id: orderID },
    include: { details: true },
  });
  if (!order) {
    return res.status(404).json({ success: false, error: "Order not found" });
  }

  // authorization: owner or employee/store_manager
  const me         = session?.user;
  const isOwner    = me?.id === order.user_id;
  const isEmployee =
    me?.role === Role.employee || me?.role === Role.store_manager;
  if (!isOwner && !isEmployee) {
    return res.status(403).json({ success: false, error: "Forbidden" });
  }

  // build & return response
  return res.status(200).json({
    success: true,
    order: {
      order_id:     order.order_id,
      store_id:     order.store_id,
      user_id:      order.user_id,
      status:       order.order_status,
      total_amount: order.total_amount,
      created_at:   order.created_at,
      details:      order.details.map(d => ({
        variant_id:        d.variant_id,
        quantity:          d.quantity,
        price_at_purchase: d.price_at_purchase,
      })),
    },
  });
}
