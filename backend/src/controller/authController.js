import crypto from "crypto";
import { User } from "../model/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.js";

const generateToken = (user) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not configured on the server");
    }
    return jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
};

const isValidEmail = (email) => {
    return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
};

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (typeof name !== "string" || name.trim().length < 2) {
            return res.status(400).json({ message: "Name must be at least 2 characters long" });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({ message: "Please provide a valid email address" });
        }

        if (typeof password !== "string" || password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const emailRegex = new RegExp(`^${escapeRegex(normalizedEmail)}$`, "i");
        const existingUser = await User.findOne({ email: emailRegex });

        if (existingUser && existingUser.verified) {
            return res.status(400).json({ message: "User already exists with this email" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
        const role = (adminEmail && normalizedEmail === adminEmail) ? "admin" : "user";

        const otp = Math.floor(100000 + Math.random() * 900000);
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

        let user;
        if (existingUser && !existingUser.verified) {
            existingUser.name = name.trim();
            existingUser.email = normalizedEmail;
            existingUser.password = hashedPassword;
            existingUser.role = role;
            existingUser.otp = otp;
            existingUser.otpExpiry = otpExpiry;
            user = await existingUser.save();
        } else {
            user = await User.create({
                name: name.trim(),
                email: normalizedEmail,
                password: hashedPassword,
                role,
                verified: false,
                otp,
                otpExpiry
            });
        }

        if (user) {
            const message = `
            <h2>Welcome to ShopNext, ${name.trim()}!</h2>
            <p>Your one-time verification code is: <strong>${otp}</strong></p>
            <p>This code will expire in 5 minutes.</p>
            <p>Thank you for choosing ShopNext!</p>
            `;

            sendEmail(normalizedEmail, "Verify Your ShopNext Account - OTP", message).catch(() => {});

            return res.status(201).json({
                requiresVerification: true,
                email: user.email,
                message: "OTP sent to your email. Please enter the OTP to verify your account."
            });
        } else {
            return res.status(400).json({ message: "User registration failed" });
        }

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "User already exists with this email" });
        }
        console.error("Register Error:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: "Email and OTP are required" });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const emailRegex = new RegExp(`^${escapeRegex(normalizedEmail)}$`, "i");
        const user = await User.findOne({ email: emailRegex });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.verified) {
            return res.status(400).json({ message: "Email is already verified. Please login." });
        }

        if (!user.otp || !user.otpExpiry) {
            return res.status(400).json({ message: "No OTP found. Please request a new OTP." });
        }

        if (new Date() > new Date(user.otpExpiry)) {
            return res.status(400).json({ message: "OTP has expired. Please request a new OTP." });
        }

        if (String(user.otp) !== String(otp).trim()) {
            return res.status(400).json({ message: "Invalid OTP. Please check and try again." });
        }

        user.verified = true;
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        return res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            verified: user.verified,
            token: generateToken(user),
            message: "Email verified successfully!"
        });
    } catch (error) {
        console.error("Verify OTP Error:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const resendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email || !isValidEmail(email)) {
            return res.status(400).json({ message: "Please provide a valid email address" });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const emailRegex = new RegExp(`^${escapeRegex(normalizedEmail)}$`, "i");
        const user = await User.findOne({ email: emailRegex });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.verified) {
            return res.status(400).json({ message: "Email is already verified. Please login." });
        }

        const otp = Math.floor(100000 + Math.random() * 900000);
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
        user.otp = otp;
        user.otpExpiry = otpExpiry;
        await user.save();

        const message = `
        <h2>ShopNext Email Verification</h2>
        <p>Your new one-time verification code is: <strong>${otp}</strong></p>
        <p>This code will expire in 5 minutes.</p>
        `;

        sendEmail(normalizedEmail, "ShopNext - Your New Verification OTP", message).catch(() => {});

        return res.status(200).json({
            message: "A new OTP has been sent to your email."
        });
    } catch (error) {
        console.error("Resend OTP Error:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password || typeof email !== "string" || typeof password !== "string") {
            return res.status(400).json({ message: "Valid email and password are required" });
        }

        const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
        const adminPassword = process.env.ADMIN_PASSWORD;
        const normalizedEmail = email.trim().toLowerCase();

        // Timing-safe comparison for admin credentials if set
        let isAdminMatch = false;
        if (adminEmail && adminPassword && normalizedEmail === adminEmail) {
            const bufA = Buffer.from(password);
            const bufB = Buffer.from(adminPassword);
            if (bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB)) {
                isAdminMatch = true;
            }
        }

        const emailRegex = new RegExp(`^${escapeRegex(normalizedEmail)}$`, "i");
        let user = await User.findOne({ email: emailRegex });

        if (isAdminMatch) {
            if (!user) {
                // Auto-create initial admin user
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);
                user = await User.create({
                    name: "Admin",
                    email: normalizedEmail,
                    password: hashedPassword,
                    role: "admin",
                    verified: true
                });
            } else if (user.role !== "admin") {
                user.role = "admin";
                await user.save();
            }

            return res.status(200).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: "admin",
                token: generateToken(user)
            });
        }

        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        if (!user.verified && user.otp) {
            return res.status(403).json({
                requiresVerification: true,
                email: user.email,
                message: "Your email is not verified yet. Please verify using the OTP sent to your email."
            });
        }

        // Elevate to admin if matching ADMIN_EMAIL
        if (adminEmail && normalizedEmail === adminEmail && user.role !== "admin") {
            user.role = "admin";
            await user.save();
        }

        return res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user)
        });
    } catch (error) {
        console.error("Login Error:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const getUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password -otp -otpExpiry");
        return res.status(200).json(users);
    } catch (error) {
        console.error("GetUsers Error:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export { registerUser, verifyOtp, resendOtp, loginUser, getUsers };
