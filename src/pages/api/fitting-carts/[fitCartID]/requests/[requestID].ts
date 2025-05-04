import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]";
import { prisma } from "../../../../../../lib/prisma";
import { FittingRoomRequest, RequestStatus, Role } from "@/generated/prisma";

type SuccessResp = {success: true; request_id: FittingRoomRequest["request_id"];status?: RequestStatus} | { success: true };
type ErrorResp = { success: false; error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<SuccessResp | ErrorResp>) {
    const { requestID } = req.query;
    if (typeof requestID !== "string") {
        return res.status(400).json({ success: false, error: "Invalid Request ID" });
    }

    if (req.method === "PUT") {
        const { status } = req.body as { status?: string };
        if (status !== "fulfilled" && status !== "cancelled") {
            return res.status(400).json({ success: false, error: "Invalid status" });
        }
    
        // load session + original request
        const session = await getServerSession(req, res, authOptions);
        const reqRow  = await prisma.fittingRoomRequest.findUnique({
            where: { request_id: requestID },
        });
        
        if (!reqRow) {
            return res.status(404).json({ success: false, error: "Request not found" });
        }
    
        // authorization
        if (status === "fulfilled") {
            if (session?.user?.role !== Role.employee) {
                return res.status(403).json({ success: false, error: "Forbidden" });
            }
        } else {
            if (reqRow.user_id) {
                // only original signed-in customer may cancel
                if (session?.user?.id !== reqRow.user_id) {
                    return res.status(403).json({ success: false, error: "Forbidden" });
                }
            }
            // otherwise guest request passes
        }
    
        // perform update
        try {
            const updated = await prisma.fittingRoomRequest.update({
                where: { request_id: requestID },
                data: { status },
            });
            return res.status(200).json({ success: true, request_id: updated.request_id, status: updated.status });
        } catch {
            return res.status(500).json({ success: false, error: "Failed to update request status" });
        }
    } else if (req.method === "DELETE") {
        const session = await getServerSession(req, res, authOptions);
        const existing = await prisma.fittingRoomRequest.findUnique({
            where: { request_id: requestID },
            select: { user_id: true },
        });

        if (!existing) {
            return res.status(404).json({ success: false, error: "Request not found" });
        }

        // if signed-in user's req then only they can delete
        if (existing.user_id) {
            if (session?.user?.id !== existing.user_id) {
                return res.status(403).json({ success: false, error: "Forbidden" });
            }
        }

        try {
            await prisma.fittingRoomRequest.delete({
                where: { request_id: requestID },
            });
            
            return res.status(200).json({ success: true });
        } catch {
            return res.status(500).json({ success: false, error: "Failed to delete request" });
        }
    } else {
        res.setHeader("Allow", "PUT, DELETE");
        return res.status(405).json({ success: false, error: "Method Not Allowed" });
    }
}
