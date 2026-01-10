import mongoose from "mongoose";

interface IUser {
  _id?: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  mobile?: string;
  role: "user" | "deliveryBoy" | "admin";
  image?: string;
  socketId?: string | null;
  isOnline?: boolean;
  location?: {
    type: "Point";
    coordinates: [number, number];
  };
}

const userSchema = new mongoose.Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String },
    mobile: { type: String },
    role: {
      type: String,
      enum: ["user", "deliveryBoy", "admin"],
      default: "user",
    },
    image: { type: String },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: false,
        default: undefined,
      },
    },

    socketId: { type: String, default: null },
    isOnline: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.index({ location: "2dsphere" });

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
