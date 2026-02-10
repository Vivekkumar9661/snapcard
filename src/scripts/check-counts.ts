import connectDb from "../lib/db";
import mongoose from "mongoose";
require("dotenv").config({ path: ".env.local" });

async function checkCounts() {
    try {
        await connectDb();
        const db = mongoose.connection.db;
        if (!db) {
            console.error("No DB connection");
            process.exit(1);
        }

        const collection = db.collection("deliveryassignments");

        const countBrodcasted = await collection.countDocuments({ status: "brodcasted" });
        const countBroadcasted = await collection.countDocuments({ status: "broadcasted" });
        const countBrodcastedTo = await collection.countDocuments({ brodcastedTo: { $exists: true } });
        const countBroadcastedTo = await collection.countDocuments({ broadcastedTo: { $exists: true } });

        console.log(`Brodcasted (Old): ${countBrodcasted}`);
        console.log(`Broadcasted (New): ${countBroadcasted}`);
        console.log(`BrodcastedTo field exists: ${countBrodcastedTo}`);
        console.log(`BroadcastedTo field exists: ${countBroadcastedTo}`);

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkCounts();
