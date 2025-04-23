import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]";
import { ProductVariant, Role } from "@/generated/prisma";

type VariantResponse = 
    | { success: true; variant: { variant_id: ProductVariant["variant_id"]; size: ProductVariant["size"]; color: ProductVariant["color"] } }
    | { success: false; error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<VariantResponse>) {
    const { id, variantID } = req.query;
    if (typeof id !== "string" || typeof variantID !== "string") {
        return res.status(400).json({ success: false, error: "Invalid IDs" });
    }

    if (req.method !== "PUT") {
        res.setHeader("Allow", "PUT");
        return res.status(405).json({ success: false, error: "Method Not Allowed" });
    }

    // Protected Access - Store Manager only
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id || session.user.role !== Role.store_manager) {
        return res.status(403).json({ success: false, error: "Forbidden" });
    }

    // extract payload 
    const { size, color } = req.body as {
        size?: string;
        color?: string;
    };

    if (size == null && color == null) {
        return res.status(400).json({ success: false, error: "At least one of size or color is required" });
    }

    try {
        const updated = await prisma.productVariant.update({
            where: { variant_id: variantID },
            data: {
                ...(size != null ? { size } : {}),
                ...(color != null ? { color } : {}),
            },
            select: { variant_id: true, size: true, color: true },
        });
        return res.status(200).json({ success: true, variant: updated });
    } catch (err: any) {
        return res.status(500).json({ success: false, error: "Failed to update product variant" });
    }

}






