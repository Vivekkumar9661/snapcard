
import mongoose from "mongoose";
import connectDb from "../lib/db";
import DeliveryAssignment from "../models/deliveryAssignment.model";
import Order from "../models/order.model";
import User from "../models/user.model";
import "../models/grocery.model"; // Ensure Grocery is loaded

const debug = async () => {
    try {
        console.log("Connecting to DB...");
        // Mock environment variables if needed, or rely on .env (loaded by ts-node/dotenv typically, or assume user has env vars set)
        // Note: process.env.MONGODB_URL must be set.
        require("dotenv").config({ path: ".env.local" });

        await connectDb();
        console.log("Connected.");

        // 1. Check if models are registered
        console.log("Registered models:", Object.keys(mongoose.models));

        // 2. Try to find ONE assignment and populate it
        console.log("Fetching one assignment...");
        const assignment = await DeliveryAssignment.findOne({
            status: "broadcasted"
        })
            .populate({
                path: "order",
                select: "address totalAmount",
            })
            .populate("assignedTo");

        if (!assignment) {
            console.log("No 'broadcasted' assignment found. Trying any assignment...");
            const anyAssignment = await DeliveryAssignment.findOne({}).populate("order");
            console.log("Any assignment found?", !!anyAssignment);
            if (anyAssignment) console.log("Assignment:", JSON.stringify(anyAssignment, null, 2));
        } else {
            console.log("Successfully fetched and populated assignment:");
            console.log(JSON.stringify(assignment, null, 2));
        }

    } catch (error) {
        console.error("❌ ERROR in debug script:", error);
        if (error instanceof Error) {
            console.error("Stack:", error.stack);
        }
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected.");
    }
};

debug();
