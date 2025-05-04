import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../../lib/prisma";
import { FittingCart } from "@/generated/prisma";

type ResponseData =
  | { success: true; fitting_cart_id: FittingCart["fitting_cart_id"]; expires_at: FittingCart["expires_at"] }
  | { success: false; error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  // Authenticate (optional)
  const session = await getServerSession(req, res, authOptions);
  const userID = session?.user?.id;

  // Extract store_id
  const { store_id } = req.body as { store_id?: string };
  if (!store_id) {
    return res.status(400).json({ success: false, error: "Missing store_id" });
  }

  // Validate store exists
  const store = await prisma.store.findUnique({ where: { store_id } });
  if (!store) {
    return res.status(404).json({ success: false, error: "Store Not Found" });
  }

  // Always create a fresh fitting cart
  const now = new Date();
  const expireTime = new Date(now.getTime() + 110 * 60 * 1000);

  const cart = await prisma.fittingCart.create({
    data: {
      store: { connect: { store_id } },
      ...(userID ? { user: { connect: { user_id: userID } } } : {}),
      expires_at: expireTime,
    },
  });

  return res.status(201).json({
    success: true,
    fitting_cart_id: cart.fitting_cart_id,
    expires_at: cart.expires_at,
  });
}