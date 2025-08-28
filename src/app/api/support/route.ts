// app/api/support/route.ts

import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
    try {
        const { name, email, message, refId } = await req.json();

        if (!name || !email || !message || !refId) {
            return NextResponse.json(
                { error: "All fields are required" },
                { status: 400 }
            );
        }

        // Configure transporter (use your SMTP creds here)
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com", // or your SMTP server
            port: 465,
            secure: true,
            auth: {
                user: process.env.SMTP_USER, // dev@kpoint.com
                pass: process.env.SMTP_PASS, // app password or SMTP key
            },
        });

        // Prepare email
        const mailOptions = {
            from: `"KPOINT Support" <dev@kpoint.com>`,
            to: "helpdesk@kpoint.com",
            cc: email,
            subject: `Support Request [Ref ID: ${refId}]`,
            html: `
        <h3>Support Form Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong> ${message}</p>
        <p><strong>Ref ID:</strong> ${refId}</p>
      `,
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json({ success: true, message: "Mail sent successfully" });
    } catch (error) {
        console.error("Mail send error:", error);
        return NextResponse.json(
            { error: "Failed to send email" },
            { status: 500 }
        );
    }
}
