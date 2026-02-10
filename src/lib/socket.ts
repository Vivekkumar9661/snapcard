// import { io, Socket } from "socket.io-client";
// export const runtime = "nodejs";

// let socket: Socket | null = null;
// export const getSocket = () => {
//   if (!socket) {
//     socket = io(process.env.NEXT_PUBLIC_SOCKET_SERVER);
//   }
//   return socket;
// };
"use client";

import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    // If running with custom server, we can usually connect to the same origin
    const URL = process.env.NEXT_PUBLIC_SOCKET_SERVER || process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";

    socket = io(URL, {
      transports: ["websocket"],
      autoConnect: true,
      path: "/socket.io", // Ensure we use the default path
    });
  }

  return socket;
};
