import connectDb from "../lib/db";
import mongoose from "mongoose";
require("dotenv").config({ path: ".env.local" });

async function migrate() {
    try {
        await connectDb();
        const db = mongoose.connection.db;
        if (!db) {
            console.error("No DB connection");
            process.exit(1);
        }

        console.log("Starting migration...");

        const collection = db.collection("deliveryassignments");

        // 1. Rename 'brodcastedTo' field to 'broadcastedTo'
        const renameResult = await collection.updateMany(
            { brodcastedTo: { $exists: true } },
            { $rename: { "brodcastedTo": "broadcastedTo" } }
        );
        console.log(`Renamed fields: ${renameResult.modifiedCount}`);

        // 2. Update status 'brodcasted' to 'broadcasted'
        const statusResult = await collection.updateMany(
            { status: "brodcasted" },
            { $set: { status: "broadcasted" } }
        );
        console.log(`Updated statuses: ${statusResult.modifiedCount}`);

        // 3. Update status 'deliverd' to 'delivered' in orders collection
        const ordersCollection = db.collection("orders");
        const orderStatusResult = await ordersCollection.updateMany(
            { status: "deliverd" },
            { $set: { status: "delivered" } }
        );
        console.log(`Updated order statuses: ${orderStatusResult.modifiedCount}`);

        console.log("Migration completed.");
        process.exit(0);
    } catch (e) {
        console.error("Migration failed:", e);
        process.exit(1);
    }
}

migrate();
