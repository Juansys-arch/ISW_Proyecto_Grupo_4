"use strict";

import nodemailer from "nodemailer";
import {
    EMAIL_HOST,
    EMAIL_PORT,
    EMAIL_USER,
    EMAIL_PASS,
} from "../config/configEnv.js";

const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: Number(EMAIL_PORT),
    secure: false,
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
    },
});

export async function sendEmail(to, subject, text, html = null) {
    try {
        const info = await transporter.sendMail({
            from: `"Sistema de Gestión de Incidencias" <${EMAIL_USER}>`,
            to,
            subject,
            text,
            html,
        });

        console.log(" Correo enviado:", info.messageId);

        return [info, null];
    } catch (error) {
        console.error(" Error:", error.message);
        return [null, error.message];
    }
}