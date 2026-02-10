import { auth } from "@/auth";
import connectDb from "@/lib/db";
import DeliveryAssignment from "@/models/deliveryAssignment.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await connectDb();
        // ✅ Unwrapped params for Next.js compatibility
        const resolvedParams = await (params as any);
        const { id } = resolvedParams;

        const session = await auth();
        const deliveryBoyID = session?.user?.id;

        console.log(`[API:Reject:v2] Processing ID: ${id}, User: ${deliveryBoyID}`);

        if (!deliveryBoyID) {
            return NextResponse.json({ message: "[V2] Unauthorized" }, { status: 401 });
        }

        const assignment = await DeliveryAssignment.findById(id);
        if (!assignment) {
            console.log(`[API:Reject:v2] Assignment ${id} NOT FOUND in DB`);
            return NextResponse.json({ message: `[V2] Assignment ${id} not found in database` }, { status: 404 });
        }

        // ✅ If the delivery boy rejects, we remove them from the broadcastedTo list
        // This ensures they don't see this assignment again.
        if ((assignment as any).broadcastedTo) {
            (assignment as any).broadcastedTo = (assignment as any).broadcastedTo.filter(
                (boyId: any) => boyId.toString() !== deliveryBoyID
            );
        }
        if ((assignment as any).brodcastedTo) {
            (assignment as any).brodcastedTo = (assignment as any).brodcastedTo.filter(
                (boyId: any) => boyId.toString() !== deliveryBoyID
            );
        }

        await assignment.save();

        return NextResponse.json({
            success: true,
            message: "Assignment rejected successfully",
        });
    } catch (error) {
        console.error("REJECT ASSIGNMENT ERROR:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
