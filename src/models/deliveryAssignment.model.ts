import mongoose from "mongoose";

/* ================= ✅ ADDITIONS ================= */

// Populated Order typing
export interface IPopulatedOrder {
  _id: mongoose.Types.ObjectId;
  address: {
    fullName: string;
    mobile: string;
    city: string;
    state: string;
    fullAddress: string;
    pincode: string;
    latitude: number;
    longitude: number;
  };
  totalAmount?: number;
  status: string;
  item: any[];
}

// Populated Assignment typing
export type IDeliveryAssignmentPopulated = Omit<IDeliveryAssignment, "order"> & {
  order: IPopulatedOrder;
};

/* ================= ORIGINAL CODE ================= */

export interface IDeliveryAssignment {
  _id?: mongoose.Types.ObjectId;
  order: mongoose.Types.ObjectId;
  broadcastedTo: mongoose.Types.ObjectId[];
  assignedTo: mongoose.Types.ObjectId | null;
  status: "broadcasted" | "assigned" | "completed";
  acceptedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const deliveryAssignmentSchema = new mongoose.Schema<IDeliveryAssignment>(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    broadcastedTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    status: {
      type: String,
      enum: ["broadcasted", "assigned", "completed"],
      default: "broadcasted",
    },
    acceptedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

console.log("🔵 DeliveryAssignment Model Loaded");
let DeliveryAssignment: mongoose.Model<IDeliveryAssignment>;
if (mongoose.models.DeliveryAssignment) {
  DeliveryAssignment = mongoose.models.DeliveryAssignment;
} else {
  DeliveryAssignment = mongoose.model("DeliveryAssignment", deliveryAssignmentSchema);
}

export default DeliveryAssignment;
