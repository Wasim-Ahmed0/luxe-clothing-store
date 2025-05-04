import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]";
import { prisma } from "../../../../../../lib/prisma";
import { FittingRoomRequest, RequestStatus, Role } from "@/generated/prisma";

type SuccessResp = {success: true; request_id: FittingRoomRequest["request_id"]; status?: RequestStatus; fitting_room_id?: string} 
    | { success: true };
type ErrorResp = { success: false; error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<SuccessResp | ErrorResp>) {
    const { requestID } = req.query;
    if (typeof requestID !== "string") {
        return res.status(400).json({ success: false, error: "Invalid Request ID" });
    }

    if (req.method === "PUT") {
        const { status, fitting_room_id } = req.body as {
            status?: string
            fitting_room_id?: string
        }
      
        // must send at least one of them
        if (
            status !== undefined &&
            status !== "fulfilled" &&
            status !== "cancelled"
        ) {
            return res.status(400).json({ success: false, error: "Invalid status" })
        }
        if (status === undefined && fitting_room_id === undefined) {
            return res.status(400).json({ success: false, error: "Must provide status or fitting_room_id" })
        }
    
        // fetch original
        const session = await getServerSession(req, res, authOptions)
        const existing = await prisma.fittingRoomRequest.findUnique({
            where: { request_id: requestID },
        })
        
        if (!existing) {
            return res.status(404).json({ success: false, error: "Request not found" })
        }
    
        // Authorization for status changes
        if (status) {
            if (status === "fulfilled") {
                if (
                    session?.user?.role !== Role.employee &&
                    session?.user?.role !== Role.store_manager
                ) {
                    return res.status(403).json({ success: false, error: "Forbidden" })
                }
            } else {
                // cancelled by customer only
                if (existing.user_id) {
                    if (session?.user?.id !== existing.user_id) {
                        return res.status(403).json({ success: false, error: "Forbidden" })
                    }
                }
            }
        }
    
        // Authorization for room assignments
        if (fitting_room_id !== undefined) {
            if (
                session?.user?.role !== Role.employee &&
                session?.user?.role !== Role.store_manager
            ) {
                return res.status(403).json({ success: false, error: "Forbidden" })
            }
        }
    
        // Build the update payload
        const data: Record<string, any> = {}
        if (status) data.status = status
        if (fitting_room_id !== undefined) data.fitting_room_id = fitting_room_id
    
        try {
            const updated = await prisma.fittingRoomRequest.update({
                where: { request_id: requestID },
                data,
            })
            
            return res.status(200).json({
                success: true,
                request_id: updated.request_id,
                status: updated.status,
                fitting_room_id: updated.fitting_room_id ?? undefined,
            })
        } catch (err) {
            return res.status(500).json({ success: false, error: "Failed to update request" })
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
