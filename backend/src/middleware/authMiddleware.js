import jwt from "jsonwebtoken";
import { User } from "../model/user.model.js";

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1];
            if (!process.env.JWT_SECRET) {
                console.error("[FATAL] JWT_SECRET is not configured on server.");
                return res.status(500).json({ message: "Server authentication error" });
            }
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select("-password");

            if (!req.user) {
                return res.status(401).json({ message: "User not found or account deactivated" });
            }

            return next();
        } catch (error) {
            return res.status(401).json({ message: "Not authorized, token invalid or expired" });
        }
    }

    if (!token) {
        return res.status(401).json({ message: "Not authorized, no token provided" });
    }
};

export { protect };
