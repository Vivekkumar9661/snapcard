"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { getSocket } from "@/lib/socket";

const InitUser = () => {
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user?.id) return;

    const socket = getSocket();

    // 🔥 YE LINE SABSE IMPORTANT HAI
    socket.emit("identity", session.user.id);
  }, [session?.user?.id]);

  return null;
};

export default InitUser;
