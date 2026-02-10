import connectDb from "@/lib/db";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        await connectDb();
        const db = mongoose.connection.db;
        if (!db) {
            return NextResponse.json({ error: "DB not connected" }, { status: 500 });
        }

        const collection = db.collection("deliveryassignments");

        // 1. Rename 'brodcastedTo' field to 'broadcastedTo'
        const renameResult = await collection.updateMany(
            { brodcastedTo: { $exists: true } },
            { $rename: { "brodcastedTo": "broadcastedTo" } }
        );

        // 2. Update status 'brodcasted' to 'broadcasted'
        const statusResult = await collection.updateMany(
            { status: "brodcasted" },
            { $set: { status: "broadcasted" } }
        );

        // 3. Fix ID Types (Convert string IDs to ObjectIDs)
        const allAssignments = await collection.find({}).toArray();
        let idFixCount = 0;
        for (const assignment of allAssignments) {
            let needsUpdate = false;
            const updateOps: any = {};

            // Fix broadcastedTo array
            const bTo = assignment.broadcastedTo || assignment.brodcastedTo || [];
            if (Array.isArray(bTo)) {
                const newBTo = bTo.map(id => {
                    if (typeof id === 'string' && id.length === 24) {
                        needsUpdate = true;
                        return new mongoose.Types.ObjectId(id);
                    }
                    return id;
                });
                if (needsUpdate) {
                    const fieldName = assignment.broadcastedTo ? "broadcastedTo" : "brodcastedTo";
                    updateOps[fieldName] = newBTo;
                }
            }

            // Fix assignedTo field
            if (typeof assignment.assignedTo === 'string' && assignment.assignedTo.length === 24) {
                needsUpdate = true;
                updateOps.assignedTo = new mongoose.Types.ObjectId(assignment.assignedTo);
            }

            if (needsUpdate) {
                await collection.updateOne({ _id: assignment._id }, { $set: updateOps });
                idFixCount++;
            }
        }

        // 3. Update status 'deliverd' to 'delivered' in orders collection
        const ordersCollection = db.collection("orders");
        const orderStatusResult = await ordersCollection.updateMany(
            { status: "deliverd" },
            { $set: { status: "delivered" } }
        );

        return NextResponse.json({
            success: true,
            renamedFields: renameResult.modifiedCount,
            updatedAssignmentStatuses: statusResult.modifiedCount,
            updatedOrderStatuses: orderStatusResult.modifiedCount,
            idFixes: idFixCount
        });
    } catch (error) {
        console.error("MIGRATION API ERROR:", error);
        return NextResponse.json({ error: "Migration failed" }, { status: 500 });
    }
}
