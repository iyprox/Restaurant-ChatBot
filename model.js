const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  sessionId: String,
  orders: [{ id: String, name: String }],
  createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;