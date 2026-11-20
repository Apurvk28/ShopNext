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
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS,
            },
        });

        const mailOptions = {
            from: `"ShopNext Support" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: subject,
            html: message,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email successfully sent to ${email}`);
    } catch (error) {
        console.error(`Failed to send email to ${email}: ${error.message}`);
    }
};

export { sendEmail };
export default sendEmail;
