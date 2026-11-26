import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";
import { Product } from "../model/product.model.js";

dotenv.config();

const createOrder = async (req, res) => {
    try {
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            return res.status(500).json({ message: "Payment gateway credentials not configured" });
        }

        const { items, amount } = req.body;
        let calculatedTotal = 0;

        // Strictly calculate price on the server side if items array is passed
        if (Array.isArray(items) && items.length > 0) {
            const productIds = items.map(item => item.productId || item._id);
            const dbProducts = await Product.find({ _id: { $in: productIds } });
            const productMap = new Map(dbProducts.map(p => [p._id.toString(), p]));

            for (const item of items) {
                const pId = (item.productId || item._id)?.toString();
                const dbProduct = productMap.get(pId);

                if (!dbProduct) {
                    return res.status(400).json({ message: `Product not found: ${pId}` });
                }

                const qty = Number(item.qty);
                if (!Number.isInteger(qty) || qty <= 0) {
                    return res.status(400).json({ message: `Invalid quantity for ${dbProduct.name}` });
                }

                if (dbProduct.stock < qty) {
                    return res.status(400).json({
                        message: `Insufficient stock for "${dbProduct.name}". Available: ${dbProduct.stock}`
                    });
                }

                calculatedTotal += dbProduct.price * qty;
            }
        } else if (typeof amount === "number" && amount > 0) {
            // Fallback for direct amount only when items array is omitted
            calculatedTotal = amount;
        } else {
            return res.status(400).json({ message: "No items or valid amount provided" });
        }

        if (calculatedTotal <= 0) {
            return res.status(400).json({ message: "Order total must be greater than zero" });
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });

        const options = {
            amount: Math.round(calculatedTotal * 100), // convert to paise
            currency: "INR",
            receipt: `rcpt_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        };

        const order = await razorpay.orders.create(options);
        return res.status(200).json({
            ...order,
            key_id: process.env.RAZORPAY_KEY_ID,
            calculatedTotal
        });
    } catch (error) {
        console.error("Payment Order Error:", error.message);
        return res.status(500).json({ message: error.message || "Failed to initiate payment" });
    }
};

const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ message: "Missing required payment verification parameters" });
        }

        const sign = `${razorpay_order_id}|${razorpay_payment_id}`;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign)
            .digest("hex");

        const signBuffer = Buffer.from(razorpay_signature);
        const expectedBuffer = Buffer.from(expectedSign);

        const isSignatureValid =
            signBuffer.length === expectedBuffer.length &&
            crypto.timingSafeEqual(signBuffer, expectedBuffer);

        if (isSignatureValid) {
            return res.status(200).json({ success: true, message: "Payment verified successfully" });
        } else {
            return res.status(400).json({ success: false, message: "Invalid payment signature" });
        }
    } catch (error) {
        console.error("Payment Verification Error:", error.message);
        return res.status(500).json({ message: "Internal server error during verification" });
    }
};

export { createOrder, verifyPayment };
