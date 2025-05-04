// pages/api/users/me.ts
import type { NextApiRequest, NextApiResponse } from "next"
import { getServerSession }            from "next-auth/next"
import { authOptions }                 from "../auth/[...nextauth]"
import userHandler                     from "./[id]"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.id) {
    return res.status(401).json({ success: false, error: "Not authenticated" })
  }
  // inject the ID into the query so our existing handler will pick it up
  req.query.id = session.user.id
  return userHandler(req, res)
}
