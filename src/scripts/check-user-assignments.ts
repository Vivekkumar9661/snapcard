import connectDb from "../lib/db";
import DeliveryAssignment from "../models/deliveryAssignment.model";
import mongoose from "mongoose";
require("dotenv").config({ path: ".env.local" });

async function checkUserAssignments() {
    try {
        await connectDb();
        const userId = "69653e4c32755ef9bd5e6f5d";
        console.log(`Checking assignments for User: ${userId}`);

        const assignments = await DeliveryAssignment.find({
            $or: [
                { broadcastedTo: userId },
                { brodcastedTo: userId }
            ]
        });

        console.log(`Found ${assignments.length} assignments for this user.`);
        assignments.forEach(a => {
            console.log(`- ID: ${a._id}, Status: ${a.status}`);
        });

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkUserAssignments();
