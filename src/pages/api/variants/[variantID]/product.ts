import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../../lib/prisma";
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const raw = req.query.variantID;
  const variantID = Array.isArray(raw) ? raw[0] : raw;
  const v = await prisma.inventory.findUnique({
    where: { inventory_id: variantID },
    select: { product_id: true }
  });
  if (!v) return res.status(404).json({ error: "Not found" });
  res.json({ product_id: v.product_id });
}
