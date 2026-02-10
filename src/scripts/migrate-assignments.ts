import connectDb from "../lib/db";
import mongoose from "mongoose";

async function migrate() {
    try {
        await connectDb();
        console.log("Connected to DB");

        const db = mongoose.connection.db;
        if (!db) {
            throw new Error("Database connection not established correctly");
        }
        const collection = db.collection("deliveryassignments"); // Check collection name

        // 1. Rename 'brodcastedTo' field to 'broadcastedTo'
        const renameResult = await collection.updateMany(
            { brodcastedTo: { $exists: true } },
            { $rename: { "brodcastedTo": "broadcastedTo" } }
        );
        console.log(`Renamed 'brodcastedTo' to 'broadcastedTo' in ${renameResult.modifiedCount} documents.`);

        // 2. Update status 'brodcasted' to 'broadcasted'
        const statusResult = await collection.updateMany(
            { status: "brodcasted" },
            { $set: { status: "broadcasted" } }
        );
        console.log(`Updated status 'brodcasted' to 'broadcasted' in ${statusResult.modifiedCount} documents.`);

        process.exit(0);
    } catch (error) {
        console.error("Migration Error:", error);
        process.exit(1);
    }
}

migrate();
