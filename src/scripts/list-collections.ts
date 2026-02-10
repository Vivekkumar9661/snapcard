import connectDb from "../lib/db";
import mongoose from "mongoose";
require("dotenv").config({ path: ".env.local" });

async function listCollections() {
    try {
        await connectDb();
        const db = mongoose.connection.db;
        if (!db) {
            console.error("No DB connection");
            process.exit(1);
        }
        const collections = await db.listCollections().toArray();
        console.log("Collections:", collections.map(c => c.name));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

listCollections();
