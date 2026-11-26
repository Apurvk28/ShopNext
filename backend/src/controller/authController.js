import { User } from "../model/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.js";

const generateToken = (user) => {
    return jwt.sign({ id: user._id }, process.env.JWT_SECRET || "defaultsecret", { expiresIn: "7d" });
};

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const userExists = await User.findOne({ email: new RegExp(`^${normalizedEmail}$`, 'i') });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
        const role = (adminEmail && normalizedEmail === adminEmail) ? "admin" : "user";

        const user = await User.create({ name, email, password: hashedPassword, role });
        if (user) {
            const otp = Math.floor(100000 + Math.random() * 900000);
            const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
            user.otp = otp;
            user.otpExpiry = otpExpiry;
            await user.save();

            const message = `
            Welcome to ShopNext, ${name}!
            Your OTP for ShopNext registration is ${otp} and it will expire in 5 minutes.`;

            await sendEmail(email, "Welcome to ShopNext - your OTP for registration", message);

            return res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user),
                message: "User registered successfully"
            });
        } else {
            return res.status(400).json({ message: "User not registered" });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
        const adminPassword = process.env.ADMIN_PASSWORD;
        const normalizedEmail = email.trim().toLowerCase();

        // Check if credentials match ADMIN_EMAIL and ADMIN_PASSWORD in .env
        const isAdminMatch = adminEmail && adminPassword && normalizedEmail === adminEmail && password === adminPassword;

        let user = await User.findOne({ email: new RegExp(`^${normalizedEmail}$`, 'i') });

        if (isAdminMatch) {
            if (!user) {
                // Auto-create admin user in database if it doesn't exist yet
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);
                user = await User.create({
                    name: "Admin",
                    email: process.env.ADMIN_EMAIL,
                    password: hashedPassword,
                    role: "admin",
                    verified: true
                });
            } else if (user.role !== "admin") {
                // Elevate existing user to admin
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
            return res.status(404).json({ message: "User not found" });
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
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const getUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");
        return res.status(200).json(users);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export { registerUser, loginUser, getUsers };
