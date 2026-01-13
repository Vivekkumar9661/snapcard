import mongoose from "mongoose";

export interface Iorder {
  _id?: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  item: [
    {
      grocery: mongoose.Types.ObjectId;
      name: string;
      price: string;
      unit: string;
      image: string;
      quantity: number;
    }
  ];
  isPaid: boolean;
  totalAmount: number;
  paymentMethod: "COD" | "online";
  address: {
    fullName: string;
    mobile: string;
    city: string;
    state: string;
    pincode: string;
    fullAddress: string;
    latitude: number;
    longitude: number;
  };
  assignment?: mongoose.Types.ObjectId;
  assignedDeliveryBoy?: mongoose.Types.ObjectId;
  status: "pending" | "out of delivery" | "deliverd";
  createdAt?: Date;
  updateAt?: Date;
  stripePaymentIntentId?: string;
  stripePaymentMethod?: string;
  stripeSessionId?: string;
  reconciledAt?: Date;
}

const orderSchema = new mongoose.Schema<Iorder>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    item: [
      {
        grocery: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Grocery",
          required: true,
        },
        name: String,
        price: String,
        unit: String,
        image: String,
        quantity: Number,
      },
    ],

    paymentMethod: {
      type: String,
      enum: ["COD", "online"],
      default: "COD",
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    totalAmount: Number,
    address: {
      fullName: String,
      mobile: String,
      city: String,
      state: String,
      pincode: String,
      fullAddress: String,
      latitude: Number,
      longitude: Number,
    },
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryAssignment",
      default: null,
    },
    assignedDeliveryBoy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["pending", "out of delivery", "deliverd"],
      default: "pending",
    },
    stripePaymentIntentId: {
      type: String,
      default: null,
    },
    stripePaymentMethod: {
      type: String,
      default: null,
    },
    stripeSessionId: {
      type: String,
      default: null,
    },
    reconciledAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
export default Order;
