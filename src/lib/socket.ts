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
    const URL = process.env.NEXT_PUBLIC_SOCKET_SERVER;

    if (!URL) {
      throw new Error("NEXT_PUBLIC_SOCKET_SERVER missing");
    }

    socket = io(URL, {
      transports: ["websocket"],
      autoConnect: true,
    });
  }

  return socket;
};
