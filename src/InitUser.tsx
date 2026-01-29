"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { getSocket } from "@/lib/socket";
import axios from "axios";

const InitUser = () => {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) return;

    const socket = getSocket();
    const userId = session.user.id;

    // 1. Identity
    socket.emit("identity", userId);

    const syncUserWithDb = async () => {
      if (!socket.id) return;
      try {
        await axios.post("/api/socket/connect", {
          userId: userId,
          socketId: socket.id,
        });
      } catch (error) {
        console.error("❌ Failed to sync socket with DB:", error);
      }
    };

    if (socket.connected) {
      syncUserWithDb();
    }

    // Also sync with database via API
    socket.on("connect", syncUserWithDb);

    // 2. Location Tracking (Merged from GeoUpdater)
    let watcher: number | null = null;
    if (navigator.geolocation) {
      watcher = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;

          // Emit to socket server
          socket.emit("update-location", {
            userId,
            latitude: lat,
            longitude: lon,
          });

          // Backup sync via API
          axios.post("/api/socket/update-location", {
            userId,
            latitude: lat,
            longitude: lon,
          }).catch(err => console.error("❌ Location sync failed:", err));
        },
        (err) => console.error("Geo Error:", err),
        { enableHighAccuracy: true }
      );
    }

    return () => {
      socket.off("connect");
      if (watcher !== null) navigator.geolocation.clearWatch(watcher);
    };
  }, [session?.user?.id, status]);

  return null;
};

export default InitUser;
