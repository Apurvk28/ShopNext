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
        const userExists = await User.findOne({ email: normalizedEmail });
        if (userExists) {
            return res.status(400).json({ message: "User already exists with this email" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
        const role = (adminEmail && normalizedEmail === adminEmail) ? "admin" : "user";

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role
        });

        if (user) {
            const otp = Math.floor(100000 + Math.random() * 900000);
            const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
            user.otp = otp;
            user.otpExpiry = otpExpiry;
            await user.save();

            const message = `
            <h2>Welcome to ShopNext, ${name}!</h2>
            <p>Your one-time registration code is: <strong>${otp}</strong></p>
            <p>This code will expire in 5 minutes.</p>
            <p>Thank you for choosing ShopNext!</p>
            `;

            sendEmail(normalizedEmail, "Welcome to ShopNext - Your Registration Code", message).catch(() => {});

            return res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user),
                message: "User registered successfully"
            });
        } else {
            return res.status(400).json({ message: "User registration failed" });
        }

    } catch (error) {
        console.error("Register Error:", error.message);
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

        let user = await User.findOne({ email: normalizedEmail });

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

export { registerUser, loginUser, getUsers };
