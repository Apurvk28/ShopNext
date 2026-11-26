import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        items: [
            {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true
                },
                name: {
                    type: String
                },
                qty: {
                    type: Number,
                    required: true,
                    min: 1
                },
                price: {
                    type: Number,
                    required: true,
                    min: 0
                }
            }
        ],
        totalAmount: {
            type: Number,
            required: true,
            min: 0
        },
        address: {
            fullName: {
                type: String,
                required: true,
                trim: true
            },
            street: {
                type: String,
                required: true,
                trim: true
            },
            city: {
                type: String,
                required: true,
                trim: true
            },
            postalCode: {
                type: String,
                required: true,
                trim: true
            },
            country: {
                type: String,
                required: true,
                trim: true
            }
        },
        paymentId: {
            type: String,
            required: true,
            unique: true,
            sparse: true,
            index: true
        },
        status: {
            type: String,
            enum: ["Pending", "Shipped", "Delivered"],
            default: "Pending"
        }
    },
    { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);
