import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    if (typeof id !== "string") {
        return res.status(400).json({ error: "Invalid ID" });
    }

    try {
        if (req.method === "GET") {
            const vendor = await prisma.vendors.findUnique({ where: { id } });
            return vendor ? res.status(200).json(vendor) : res.status(404).json({ error: "Vendor not found" });
        }

        if (req.method === "PUT") {
            const updatedVendor = await prisma.vendors.update({
                where: { id },
                data: req.body,
            });
            return res.status(200).json(updatedVendor);
        }

        if (req.method === "DELETE") {
            await prisma.vendors.delete({ where: { id } });
            return res.status(204).end();
        }

        return res.status(405).json({ error: "Method Not Allowed" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
