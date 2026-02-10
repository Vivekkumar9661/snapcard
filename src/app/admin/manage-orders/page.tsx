"use client";
import AdminOrderCard from "@/components/AdminOrderCard";
import { getSocket } from "@/lib/socket";
import { Iorder } from "@/models/order.model";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const ManageOrders = () => {
  const router = useRouter();
  const [order, setOrder] = useState<Iorder[]>();
  useEffect(() => {
    const getOrders = async () => {
      try {
        const result = await axios.get("/api/admin/get-orders");
        setOrder(result.data);
      } catch (error) {
        console.log(error);
      }
    };
    getOrders();
  }, []);

  useEffect(() => {
    const socket = getSocket()
    socket?.on("new-order", (newOrder) => {
      setOrder((prev) => [...prev!, newOrder]);
    });
    socket?.on("order-accepted", (data) => {
      setOrder((prev) =>
        prev?.map((o) =>
          o._id?.toString() === data.orderId
            ? { ...o, status: data.status, assignedDeliveryBoy: data.deliveryBoy }
            : o
        )
      );
    });
    return () => {
      socket?.off("new-order");
      socket?.off("order-accepted");
    };
  }, [])
  return (
    <div className="min-h-screen bg-gray-50 w-full">
      <div className="fixed top-0 left-0 w-full backdrop-blur-lg bg-white/70 shadow-sm border-b z-50">
        <div className="max-w-3xl mx-auto flex items-center gap-4 px-4 py-3">
          <button
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 active:scale-95 transition
            "
            onClick={() => router.push("/")}
          >
            <ArrowLeft size={24} className="text-green-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">My Order </h1>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-16 space-y-8">
        <div className="space-y-6">
          {order?.map((order) => (
            <AdminOrderCard key={order._id?.toString()} order={order} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManageOrders;
