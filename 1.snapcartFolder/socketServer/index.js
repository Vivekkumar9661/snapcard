import express from "express";
import http from "http";
import dotenv from "dotenv";
import { Server } from "socket.io";
import axios from "axios";

dotenv.config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 4000;
const NEXT_BASE_URL = process.env.NEXT_BASE_URL;

if (!NEXT_BASE_URL) {
  console.error("NEXT_BASE_URL is not defined");
  process.exit(1);
}

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("user connected:", socket.id);

  // IDENTITY (MOST IMPORTANT)
  socket.on("identity", async (userId) => {
    if (!userId) return;

    // bind userId with socket
    socket.data.userId = userId;

    try {
      await axios.post(
        `${NEXT_BASE_URL}/api/socket/connect`,
        {
          userId,
          socketId: socket.id,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("socket mapped:", socket.id, "→", userId);
    } catch (error) {
      console.error("identity api error:", error.message);
    }
  });

  // UPDATE LOCATION
  socket.on("update-location", async ({ userId, latitude, longitude }) => {
    if (!userId) return;

    try {
      await axios.post(
        `${NEXT_BASE_URL}/api/socket/update-location`,
        { userId, latitude, longitude },
        { headers: { "Content-Type": "application/json" } }
      );
    } catch (error) {
      console.error("location update error:", error.message);
    }
  });

  // DISCONNECT
  socket.on("disconnect", async () => {
    // agar identity hi nahi aayi
    if (!socket.data.userId) {
      console.log("disconnect without identity:", socket.id);
      return;
    }

    try {
      await axios.post(
        `${NEXT_BASE_URL}/api/socket/disconnect`,
        { socketId: socket.id },
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("user marked offline:", socket.id);
    } catch (error) {
      console.error("disconnect api error:", error.message);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Socket server running on port ${PORT}`);
});
