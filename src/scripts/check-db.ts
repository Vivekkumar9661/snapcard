import connectDb from "../lib/db";
import DeliveryAssignment from "../models/deliveryAssignment.model";
import mongoose from "mongoose";
require("dotenv").config({ path: ".env.local" });

async function checkAssignments() {
    try {
        await connectDb();
        console.log("Connected to DB");

        // Check for ANY assignments
        const allAssignments = await DeliveryAssignment.find({}).limit(10);
        console.log(`Found ${allAssignments.length} total assignments (first 10 shown)`);

        allAssignments.forEach(a => {
            console.log(`ID: ${a._id}, Status: ${a.status}, BroadcastedTo Count: ${a.broadcastedTo?.length || 0}`);
            // Check raw object to see if there are legacy fields
            const raw = a.toObject() as any;
            if (raw.brodcastedTo) console.log(`  ⚠️ Found legacy 'brodcastedTo' field length:
                 ${raw.brodcastedTo.length}`);
        });

        const brodcastedCount = await (DeliveryAssignment as any).countDocuments({ status: "brodcasted" });
        const broadcastedCount = await DeliveryAssignment.countDocuments({ status: "broadcasted" });

        console.log(`\nStats:`);
        console.log(`- Status 'brodcasted' (Legacy Typo): ${brodcastedCount}`);
        console.log(`- Status 'broadcasted' (Correct): ${broadcastedCount}`);

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

checkAssignments();
