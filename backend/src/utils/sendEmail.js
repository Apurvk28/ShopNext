import nodemailer from "nodemailer";

const sendEmail = async (param1, param2, param3) => {
    let email, subject, message;

    if (typeof param1 === "object" && param1 !== null) {
        ({ email, subject, message } = param1);
    } else {
        email = param1;
        subject = param2;
        message = param3;
    }

    try {
        const user = process.env.EMAIL_USER || process.env.GMAIL_USER || process.env.EMAIl_USER;
        const pass = process.env.EMAIL_PASS || process.env.GMAIL_PASS;

        if (!user || !pass) {
            console.warn(`[ShopNext Email] Email credentials not configured. Skipping dispatch to ${email}`);
            return;
        }

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: { user, pass },
        });

        const mailOptions = {
            from: `"ShopNext Support" <${user}>`,
            to: email,
            subject: subject,
            html: message,
        };

        await transporter.sendMail(mailOptions);
        console.log(`[ShopNext Email] Email successfully sent to ${email}`);
    } catch (error) {
        console.error(`[ShopNext Email] Failed to send email to ${email}:`, error.message);
    }
};

export { sendEmail };
export default sendEmail;
