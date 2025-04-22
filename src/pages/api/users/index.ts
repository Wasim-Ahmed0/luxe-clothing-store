import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../../lib/prisma";
import { Role } from "../../../../lib/prisma";
import argon2 from "argon2";

type ResponseData = { success: true; userId: string } | { success: false; error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method Not Allowed' });
    }

    // Authenticate current session
    const session = await getServerSession(req, res, authOptions);

    // Extract payload from req
    const { email, password, role } = req.body as { email?: string; password?: string; role?: Role; };

    if (!email || !password) {
        return res.status(400).json({ success:false, error: 'Email and Password are required' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        return res.status(409).json({ success: false, error: 'User Already Exists' });
    }

    // Check user role
    let assignedRole: Role = Role.customer;
    if (session?.user?.role === Role.store_manager && role && Object.values(Role).includes(role)) {
        assignedRole = role;
    }

    try {
        const password_hash = await argon2.hash(password)
        const user = await prisma.user.create({
            data: {
              email,
              password_hash,
              username: email.split('@')[0],
              role: assignedRole,
            },
        });
        return res.status(201).json({ success: true, userId: user.user_id });
    } catch (err: any) {
        return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}

