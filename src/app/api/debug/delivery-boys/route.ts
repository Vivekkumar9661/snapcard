
import connectDb from "@/lib/db";
import User from "@/models/user.model";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        await connectDb();

        // Find all users with role 'deliveryBoy'
        const deliveryBoys = await User.find({ role: "deliveryBoy" });

        const results = deliveryBoys.map(boy => ({
            id: boy._id,
            name: boy.name,
            email: boy.email,
            hasLocation: !!boy.location,
            coordinates: boy.location?.coordinates,
            locationType: boy.location?.type,
            isOnline: boy.isOnline
        }));

        // Check count of boys with valid coordinates
        const boysWithLocation = results.filter(b =>
            b.coordinates &&
            Array.isArray(b.coordinates) &&
            b.coordinates.length === 2 &&
            (b.coordinates[0] !== 0 || b.coordinates[1] !== 0) // Basic check, though 0,0 is valid it's rare
        );

        return NextResponse.json({
            totalDeliveryBoys: deliveryBoys.length,
            withValidLocation: boysWithLocation.length,
            details: results
        });

    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
