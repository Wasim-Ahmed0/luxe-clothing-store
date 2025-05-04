// pages/api/virtual-carts/claim.ts
import type { NextApiRequest, NextApiResponse } from "next"
import { getServerSession }           from "next-auth/next"
import { authOptions }                from "../auth/[...nextauth]"
import { prisma }                     from "../../../../lib/prisma"

type Success = { success: true }
type Error   = { success: false; error: string }

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Success|Error>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST")
    return res.status(405).json({ success: false, error: "Method Not Allowed" })
  }

  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.id) {
    return res.status(401).json({ success: false, error: "Not Authenticated" })
  }

  const { cart_id } = req.body as { cart_id?: string }
  if (!cart_id || typeof cart_id !== "string") {
    return res.status(400).json({ success: false, error: "Missing or invalid cart_id" })
  }

  try {
    await prisma.virtualCart.update({
      where: { cart_id },
      data:  { user_id: session.user.id },
    })
    return res.status(200).json({ success: true })
  } catch (e: any) {
    console.error("Failed to claim cart:", e)
    return res.status(500).json({ success: false, error: "Database error" })
  }
}
