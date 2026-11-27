import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOGO_PATH = path.resolve(__dirname, "../../../frontend/public/SmallSquareLogoJpg.jpg");

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

        const hasLogo = fs.existsSync(LOGO_PATH);
        const logoHeader = hasLogo
            ? `<div style="margin-bottom:20px;text-align:center;"><img src="cid:shopnext-logo" alt="ShopNext" style="width:72px;height:72px;border-radius:12px;object-fit:contain;" /></div>`
            : "";

        const htmlContent = `
          <div style="font-family:'Outfit',Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;color:#111827;">
            ${logoHeader}
            ${message}
          </div>
        `;

        const mailOptions = {
            from: `"ShopNext Support" <${user}>`,
            to: email,
            subject: subject,
            html: htmlContent,
            ...(hasLogo
                ? {
                      attachments: [
                          {
                              filename: "SmallSquareLogoJpg.jpg",
                              path: LOGO_PATH,
                              cid: "shopnext-logo",
                          },
                      ],
                  }
                : {}),
        };

        await transporter.sendMail(mailOptions);
        console.log(`[ShopNext Email] Email successfully sent to ${email}`);
    } catch (error) {
        console.error(`[ShopNext Email] Failed to send email to ${email}:`, error.message);
    }
};

export { sendEmail };
export default sendEmail;
