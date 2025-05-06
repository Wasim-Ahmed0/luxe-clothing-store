import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import { prisma } from "../../../../../lib/prisma";
import type { FittingRoomRequest, RequestStatus } from "@/generated/prisma";

type RequestRow = {
    request_id:      FittingRoomRequest["request_id"];
    fitting_room_id: FittingRoomRequest["fitting_room_id"];
    variant_id:      FittingRoomRequest["variant_id"];
    status:          RequestStatus;
    created_at:      Date;
};

type SuccessResp = {
    success: true;
    cart: {
        fitting_cart_id: string;
        store_id:        string;
        user_id:         string | null;
        created_at:      Date;
        expires_at:      Date;
        requests:        RequestRow[];
    };
};

type ErrorResp = { success: false; error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<SuccessResp | ErrorResp>) {
  // only allow GET
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  // validate fitCartID param
  const { fitCartID } = req.query;
  if (typeof fitCartID !== "string") {
    return res.status(400).json({ success: false, error: "Invalid cart ID" });
  }

  // fetch cart and associated requests
  const cart = await prisma.fittingCart.findUnique({
    where: { fitting_cart_id: fitCartID },
    include: { requests: true },
  });
  if (!cart) {
    return res.status(404).json({ success: false, error: "Fitting cart not found" });
  }

  // restrict access if cart tied to a user
  const session = await getServerSession(req, res, authOptions);
  if (cart.user_id && session?.user?.id !== cart.user_id) {
    return res.status(403).json({ success: false, error: "Forbidden" });
  }

  try {
    // prepare response payload
    const out: SuccessResp = {
      success: true,
      cart: {
        fitting_cart_id: cart.fitting_cart_id,
        store_id:        cart.store_id,
        user_id:         cart.user_id,
        created_at:      cart.created_at,
        expires_at:      cart.expires_at,
        requests: cart.requests.map((r) => ({
          request_id:      r.request_id,
          fitting_room_id: r.fitting_room_id,
          variant_id:      r.variant_id,
          status:          r.status,
          created_at:      r.created_at,
        })),
      },
    };
    return res.status(200).json(out);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: "Failed to Fetch Cart Details" });
  }
}
