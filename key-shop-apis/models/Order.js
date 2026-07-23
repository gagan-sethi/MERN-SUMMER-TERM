const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  image: {
    type: String
  }
});

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    username: {
      type: String,
      required: true
    },
    items: [orderItemSchema],
    totalAmount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ["Paid", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Paid"
    },
    paymentId: {
      type: String,
      required: true
    },
    razorpayOrderId: {
      type: String
    },
    shippingAddress: {
      name: String,
      phone: String,
      address: String,
      city: String,
      pincode: String
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Order", orderSchema);
