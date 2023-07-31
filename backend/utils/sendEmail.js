import nodemailer from 'nodemailer';
import asyncHandler from "express-async-handler";

const sendEmail = asyncHandler(async (subject, message, send_to, sent_from, reply_to) => {

    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    const options = {
        from: sent_from,
        to: send_to,
        replyTo: reply_to,
        subject: subject,
        html: message,
    };

    const email = await transporter.sendMail(options);

    if (!email) {
        throw new Error("El email no pudo ser enviado. Por favor, vuelva a intentarlo.");
    }
});

export default sendEmail;