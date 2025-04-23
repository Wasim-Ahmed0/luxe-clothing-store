// File: pages/api/users/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../../lib/prisma";
import { Role } from "@/generated/prisma";
import argon2 from "argon2";

type ErrorResponse = { success: false; error: string };
type GetResponse   = { success: true; user: { user_id: string; email: string; username: string; role: string } };
type UpdateResponse= { success: true; user: { user_id: string; email: string; username: string; role: string } };
type DeleteResponse= {};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ErrorResponse | GetResponse | UpdateResponse | DeleteResponse>) {
  const { id } = req.query;
  if (typeof id !== "string") {
    return res.status(400).json({ success: false, error: "Invalid User ID" });
  }

  // 1) Auth
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ success: false, error: "Not Authenticated" });
  }

  // 2) Authorise: either the user themselves or a store_manager
  const isSelf  = session.user.id === id;
  const isAdmin = session.user.role === Role.store_manager;

  // === GET /api/users/:id ===
  if (req.method === "GET") {
    if (!isSelf && !isAdmin) {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }
    const user = await prisma.user.findUnique({
      where: { user_id: id },
      select: { user_id: true, email: true, username: true, role: true },
    });
    if (!user) {
      return res.status(404).json({ success: false, error: "User Not Found" });
    }
    return res.status(200).json({ success: true, user });
  }

  // === PUT /api/users/:id ===
  if (req.method === "PUT") {
    if (!isSelf) {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }

    const { username, email, currentPassword, newPassword } = req.body as {
        username?: string
        email?: string
        currentPassword?: string
        newPassword?: string
    }

    // if changing email / password then require their current password
    if ((email && !currentPassword) || (newPassword && !currentPassword)) {
        return res.status(400).json({ success: false, error: "Current password is required to change email or password" })
    }

    // if provided their current password then verify
    if (currentPassword) {
        const user = await prisma.user.findUnique({ where: { user_id: id as string } })
        if (!user || !(await argon2.verify(user.password_hash, currentPassword))) {
          return res.status(401).json({ success: false, error: "Invalid current password" })
        }
    }

    // construct data to update
    const data: any = {};
    if (email)    data.email       = email;
    if (username) data.username    = username;
    if (newPassword) data.password_hash = await argon2.hash(newPassword);

    try {
      const updated_user = await prisma.user.update({
        where: { user_id: id as string},
        data,
        select: { user_id: true, email: true, username: true, role: true },
      });
      return res.status(200).json({ success: true, user: updated_user });
    } catch {
      return res
        .status(500)
        .json({ success: false, error: "Failed to update user" });
    }
  }

  // === DELETE /api/users/:id ===
  if (req.method === "DELETE") {
    if (!isSelf && !isAdmin) {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }
    try {
      await prisma.$transaction([
        prisma.orderDetail.deleteMany({ where: { order: { user_id: id } } }),
        prisma.order.deleteMany({ where: { user_id: id } }),

        prisma.cartItem.deleteMany({ where: { cart: { user_id: id } } }),
        prisma.virtualCart.deleteMany({ where: { user_id: id } }),

        prisma.wishlistItem.deleteMany({ where: { wishlist: { user_id: id } } }),
        prisma.wishlist.deleteMany({ where: { user_id: id } }),

        prisma.fittingRoomRequest.deleteMany({ where: { user_id: id } }),
        prisma.fittingCart.deleteMany({ where: { user_id: id } }),

        prisma.analytics.deleteMany({ where: { user_id: id } }),

        prisma.user.delete({ where: { user_id: id } }),
      ]);
        res.status(204).end();
        return;
    } catch {
      return res
        .status(500)
        .json({ success: false, error: "Failed to delete user" });
    }
  }

  // 405 for all other methods
  res.setHeader("Allow", "GET, PUT, DELETE");
  return res.status(405).json({ success: false, error: "Method Not Allowed" });
}
