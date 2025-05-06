import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../../lib/prisma";
import { Inventory, Role } from "@/generated/prisma";

type InventoryRow = {
  inventory_id: Inventory["inventory_id"];
  store_id:     Inventory["store_id"];
  product_id:   Inventory["product_id"];
  variant_id:   Inventory["variant_id"];
  quantity:     Inventory["quantity"];
  status:       Inventory["status"];
  last_updated: Inventory["last_updated"];
};

type ResponseData =
  | { success: true; data: InventoryRow[] }
  | { success: true; created: InventoryRow }
  | { success: false; error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  // only store managers allowed
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id || session.user.role !== Role.store_manager) {
    return res.status(403).json({ success: false, error: "Forbidden" });
  }

  // support GET and POST
  res.setHeader("Allow", "GET, POST");

  // GET: list inventory with optional filters
  if (req.method === "GET") {
    const { store_id, product_id, variant_id } = req.query;
    const filters: any = {};
    if (store_id)   filters.store_id   = store_id as string;
    if (product_id) filters.product_id = product_id as string;
    if (variant_id) filters.variant_id = variant_id as string;

    try {
      const rows = await prisma.inventory.findMany({
        where: filters,
        orderBy: { last_updated: "desc" },
        select: {
          inventory_id: true,
          store_id:     true,
          product_id:   true,
          variant_id:   true,
          quantity:     true,
          status:       true,
          last_updated: true,
        },
      });
      return res.status(200).json({ success: true, data: rows });
    } catch (err: any) {
      console.error(err);
      return res.status(500).json({ success: false, error: "Failed to fetch inventory" });
    }
  }

  // POST: create new inventory record
  if (req.method === "POST") {
    const { store_id, product_id, variant_id, quantity, status } =
      req.body as {
        store_id?: string;
        product_id?: string;
        variant_id?: string;
        quantity?: number;
        status?: Inventory["status"];
      };

    // require all fields
    if (
      !store_id ||
      !product_id ||
      !variant_id ||
      typeof quantity !== "number" ||
      !status
    ) {
      return res.status(400).json({ success: false, error: "All fields are required" });
    }

    try {
      const created = await prisma.inventory.create({
        data: {
          store:   { connect: { store_id } },
          product: { connect: { product_id } },
          variant: { connect: { variant_id } },
          quantity,
          status,
        },
        select: {
          inventory_id: true,
          store_id:     true,
          product_id:   true,
          variant_id:   true,
          quantity:     true,
          status:       true,
          last_updated: true,
        },
      });
      return res.status(201).json({ success: true, created });
    } catch (err: any) {
      console.error(err);
      return res.status(500).json({ success: false, error: "Failed to create inventory row" });
    }
  }

  // unsupported methods
  return res.status(405).json({ success: false, error: "Method Not Allowed" });
}
