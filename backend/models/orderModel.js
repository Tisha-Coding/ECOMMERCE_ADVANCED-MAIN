import mongoose from "mongoose";

// orderStatus: fulfillment flow (separate from payment)
const ORDER_STATUSES = ["Processing", "Shipped", "Delivered", "Cancelled"];
// paymentStatus: payment state
const PAYMENT_STATUSES = ["Pending", "Completed", "Failed"];

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  items: { type: Array, required: true },
  amount: { type: Number, required: true },
  address: { type: Object, required: true },
  deliveryPhone: { type: String, required: true },
  status: { type: String, required: true, default: "Order Placed" },
  // Human-friendly unique order identifier (e.g. ORD-20260226-4831)
  orderId: {
    type: String,
    unique: true,
    index: true,
  },
  orderStatus: {
    type: String,
    default: "Processing",
    enum: ORDER_STATUSES,
  },
  paymentMethod: { type: String, required: true },
  payment: { type: Boolean, required: true, default: false },
  paymentStatus: {
    type: String,
    default: "Pending",
    enum: PAYMENT_STATUSES,
  },
  date: { type: Number, required: true },
});

const orderModel =
  mongoose.models.order || mongoose.model("order", orderSchema);
export default orderModel;
