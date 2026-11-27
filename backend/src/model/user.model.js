import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: true
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user"
        },
        verified: {
            type: Boolean,
            default: false
        },
        otp: {
            type: Number
        },
        otpExpiry: {
            type: Date
        }
    },
    { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
