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
}

// Populated Assignment typing
export type IDeliveryAssignmentPopulated = IDeliveryAssigment & {
  order: IPopulatedOrder;
};

/* ================= ORIGINAL CODE ================= */

export interface IDeliveryAssigment {
  _id?: mongoose.Types.ObjectId;
  order: mongoose.Types.ObjectId;
  brodcastedTo: mongoose.Types.ObjectId[];
  assignedTo: mongoose.Types.ObjectId | null;
  status: "brodcasted" | "assigned" | "completed";
  acceptedAt: Date;
  createdAT?: Date;
  UpdateAt?: Date;
}

const deliveryAssignmentSchema = new mongoose.Schema<IDeliveryAssigment>(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    brodcastedTo: [
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
      enum: ["brodcasted", "assigned", "completed"],
      default: "brodcasted",
    },
    acceptedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

console.log("🔵 DeliveryAssignment Model Loaded");
let DeliveryAssignment: mongoose.Model<IDeliveryAssigment>;
if (mongoose.models.DeliveryAssignment) {
  DeliveryAssignment = mongoose.models.DeliveryAssignment;
} else {
  DeliveryAssignment = mongoose.model("DeliveryAssignment", deliveryAssignmentSchema);
}

export default DeliveryAssignment;
