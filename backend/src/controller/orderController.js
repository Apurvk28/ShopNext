import crypto from "crypto";
import { Order } from "../model/order.model.js";
import { Product } from "../model/product.model.js";
import sendEmail from "../utils/sendEmail.js";

const addOrderItems = async (req, res) => {
  const deductedStockItems = [];
  try {
    const { items, address, paymentId, razorpay_order_id, razorpay_signature } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "No order items provided" });
    }

    if (!address || !address.fullName || !address.street || !address.city || !address.postalCode || !address.country) {
      return res.status(400).json({ message: "Complete shipping address is required" });
    }

    if (!paymentId || typeof paymentId !== "string" || paymentId.trim().length === 0) {
      return res.status(400).json({ message: "Valid paymentId is required" });
    }

    // 1. Prevent Replay Attack / Double Spending
    const existingOrder = await Order.findOne({ paymentId });
    if (existingOrder) {
      return res.status(400).json({ message: "Payment has already been processed for an existing order" });
    }

    // 2. Cryptographic Signature Verification (if Razorpay parameters are provided)
    if (razorpay_order_id && razorpay_signature) {
      const sign = `${razorpay_order_id}|${paymentId}`;
      const expectedSign = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
        .update(sign)
        .digest("hex");

      const sigBuf = Buffer.from(razorpay_signature);
      const expBuf = Buffer.from(expectedSign);

      if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
        return res.status(400).json({ message: "Invalid payment signature verification failed" });
      }
    }

    // 3. Strict Server-Side Price & Inventory Validation
    const productIds = items.map((i) => i.productId || i._id);
    const dbProducts = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map(dbProducts.map((p) => [p._id.toString(), p]));

    let calculatedTotal = 0;
    const verifiedItems = [];

    for (const item of items) {
      const pId = (item.productId || item._id)?.toString();
      const dbProduct = productMap.get(pId);

      if (!dbProduct) {
        return res.status(400).json({ message: `Product not found in database: ${pId}` });
      }

      const qty = Number(item.qty);
      if (!Number.isInteger(qty) || qty <= 0) {
        return res.status(400).json({ message: `Invalid item quantity for ${dbProduct.name}` });
      }

      if (dbProduct.stock < qty) {
        return res.status(400).json({
          message: `Insufficient stock for "${dbProduct.name}". Available: ${dbProduct.stock}`
        });
      }

      calculatedTotal += dbProduct.price * qty;
      verifiedItems.push({
        productId: dbProduct._id,
        name: dbProduct.name,
        qty,
        price: dbProduct.price
      });
    }

    // 4. Atomic Inventory Deduction with Rollback on Contention (Race-condition prevention)
    for (const item of verifiedItems) {
      const updatedProduct = await Product.findOneAndUpdate(
        { _id: item.productId, stock: { $gte: item.qty } },
        { $inc: { stock: -item.qty } },
        { new: true }
      );

      if (!updatedProduct) {
        // Rollback already deducted items
        for (const rolledBack of deductedStockItems) {
          await Product.findByIdAndUpdate(rolledBack.productId, {
            $inc: { stock: rolledBack.qty }
          });
        }
        return res.status(400).json({
          message: `Stock reservation conflict for ${item.name}. Please try again.`
        });
      }

      deductedStockItems.push({ productId: item.productId, qty: item.qty });
    }

    // 5. Create Order with Server-Calculated Pricing
    const order = new Order({
      userId: req.user._id,
      items: verifiedItems,
      totalAmount: calculatedTotal,
      address,
      paymentId
    });

    const createdOrder = await order.save();

    // 6. Send Order Confirmation Email
    const message = `
      <h2>Order Confirmation</h2>
      <p>Hello ${req.user.name},</p>
      <p>Your order has been placed successfully! Order ID: <strong>${createdOrder._id}</strong></p>
      <p>Total Amount Paid: <strong>₹${calculatedTotal.toFixed(2)}</strong></p>
      <p>Shipping To: ${address.street}, ${address.city}, ${address.postalCode}, ${address.country}</p>
      <p>Thank you for shopping with ShopNext!</p>
    `;

    sendEmail({
      email: req.user.email,
      subject: "ShopNext - Order Confirmation",
      message
    }).catch(() => {});

    return res.status(201).json(createdOrder);
  } catch (error) {
    // If any error occurred after partial stock deduction, restore stock
    for (const rolledBack of deductedStockItems) {
      await Product.findByIdAndUpdate(rolledBack.productId, {
        $inc: { stock: rolledBack.qty }
      }).catch(() => {});
    }
    console.error("AddOrderItems Error:", error.message);
    return res.status(500).json({ message: "Internal server error creating order" });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json(orders);
  } catch (error) {
    console.error("GetMyOrders Error:", error.message);
    return res.status(500).json({ message: "Internal server error fetching orders" });
  }
};

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate("userId", "name email").sort({ createdAt: -1 });
    return res.status(200).json(orders);
  } catch (error) {
    console.error("GetOrders Error:", error.message);
    return res.status(500).json({ message: "Internal server error fetching all orders" });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("userId", "name email");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // IDOR Prevention: Only order owner or admin can view order details
    const orderOwnerId = order.userId?._id ? order.userId._id.toString() : order.userId?.toString();
    const isOwner = orderOwnerId === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorized to view this order" });
    }

    return res.status(200).json(order);
  } catch (error) {
    console.error("GetOrderById Error:", error.message);
    return res.status(500).json({ message: "Internal server error fetching order" });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["Pending", "Shipped", "Delivered"];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    const updatedOrder = await order.save();
    return res.status(200).json(updatedOrder);
  } catch (error) {
    console.error("UpdateOrderStatus Error:", error.message);
    return res.status(500).json({ message: "Internal server error updating order" });
  }
};

export {
  addOrderItems,
  addOrderItems as createOrder,
  getMyOrders,
  getOrders,
  getOrderById,
  updateOrderStatus
};
