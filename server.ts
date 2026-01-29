import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
import mongoose from "mongoose";
import { loadEnvConfig } from "@next/env";

// Load environment variables from .env files
const projectDir = process.cwd();
loadEnvConfig(projectDir);

import User from "./src/models/user.model";
import connectDb from "./src/lib/db";

// Cast User to any to avoid TS union type errors with mongoose models in ts-node context
const UserModel = User as any;

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

// Initialize Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(async () => {
    // Connect to DB once at startup
    await connectDb();
    console.log("✅ MongoDB Connected for Socket Server");

    const httpServer = createServer(handle);
    const io = new Server(httpServer, {
        /* options */
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {
        console.log("⚡ New Socket Connection:", socket.id);

        // Identity event to link user ID with socket ID
        socket.on("identity", async (userId) => {
            console.log("👤 Identity received for:", userId, "Socket:", socket.id);
            if (!userId) return;

            try {
                const updated = await UserModel.findByIdAndUpdate(userId, {
                    socketId: socket.id,
                    isOnline: true
                }, { new: true });
                console.log("✅ User Online Status Updated:", updated?._id);
            } catch (err) {
                console.error("❌ Error updating user identity:", err);
            }
        });

        // Location update event
        socket.on("update-location", async (data) => {
            const { userId, latitude, longitude } = data;
            // console.log("📍 Location update:", userId, latitude, longitude);

            if (!userId || latitude === undefined || longitude === undefined) return;

            try {
                await UserModel.findByIdAndUpdate(userId, {
                    location: {
                        type: "Point",
                        coordinates: [longitude, latitude]
                    }
                });
                // console.log("✅ Location DB Updated");
            } catch (err) {
                console.error("❌ Error updating location:", err);
            }

            // Broadcast to delivery boys or admins if needed
            // socket.broadcast.emit("delivery-location-update", data);
        });

        socket.on("disconnect", async () => {
            console.log("🔌 Socket Disconnected:", socket.id);
            try {
                await UserModel.findOneAndUpdate({ socketId: socket.id }, {
                    isOnline: false
                });
                console.log("✅ User marked offline");
            } catch (err) {
                console.error("❌ Error updating disconnect status:", err);
            }
        });
    });

    httpServer.listen(port, () => {
        console.log(`> Ready on http://${hostname}:${port}`);
        console.log(`> Socket.IO server running`);
    });
});
