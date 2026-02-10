"use client";

import React, { useEffect, useState } from "react";
import { IDeliveryAssignmentPopulated } from "@/models/deliveryAssignment.model";
import { getSocket } from "@/lib/socket";

const DeliveryBoyDashboard = () => {
  const [assignments, setAssignments] = useState<
    IDeliveryAssignmentPopulated[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/delivery/get-assignments");

        console.log("STATUS:", response.status);
        const text = await response.text();
        console.log("RAW RESPONSE:", text);

        if (!response.ok) {
          let errorMsg = `API Error: ${response.status}`;
          try {
            const errData = JSON.parse(text);
            if (errData.message) errorMsg = errData.message;
            if (errData.stack) console.error("Server Stack:", errData.stack);
          } catch (e) {}

          throw new Error(errorMsg);
        }

        const data = JSON.parse(text);
        if (data.debug) console.log("DEBUG INFO FROM API:", data.debug);
        setAssignments(data.assignments || []);
      } catch (err: any) {
        console.error("Error fetching assignments:", err);
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // 🔌 Socket Listener for New Assignments
    const socket = getSocket();

    socket.on("connect", () => {
      console.log("Socket connected");
    });

    const onNewAssignment = (data: any) => {
      console.log("🔔 New Delivery Assignment:", data);
      alert(`📦 New Delivery Assignment: Status ${data.status || "Pending"}`);

      const newAssignment: any = {
        _id: data.assignmentId,
        status: "broadcasted", // Default status for new assignment
        broadcastedTo: [],
        assignedTo: null,
        acceptedAt: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        order: {
          _id: data.orderId,
          address: data.address, // Expecting full address object from socket
          totalAmount: data.totalAmount,
          status: data.orderStatus || "pending",
          item: [], // Items might not be in socket data, empty array to satisfy type
        },
      };

      setAssignments((prev) => [newAssignment, ...prev]);
    };

    const onOrderUpdated = (data: any) => {
      console.log("🔔 Order Status Updated:", data);
      setAssignments((prev) =>
        prev.map((a) => {
          // use String(...) on both sides to handle ObjectId vs string and avoid errors when null
          if (String(a.order?._id ?? "") === String(data.orderId ?? "")) {
            return {
              ...a,
              order: {
                ...a.order,
                status: data.status,
              },
            };
          }
          return a;
        }),
      );
    };

    socket.on("new-delivery-assignment", onNewAssignment);
    socket.on("order-updated", onOrderUpdated);

    return () => {
      socket.off("new-delivery-assignment", onNewAssignment);
      socket.off("order-updated", onOrderUpdated);
    };
  }, []);

  const handleAccept = async (assignmentId: string) => {
    try {
      const response = await fetch(
        `/api/delivery/assignment/${assignmentId}/accept-assignment`,
        {
          method: "POST",
        },
      );
      const data = await response.json();
      if (response.ok) {
        alert("[DASH-V2] Assignment accepted!");
        setAssignments((prev) =>
          prev.map((a) =>
            a._id?.toString() === assignmentId
              ? { ...a, status: "assigned" }
              : a,
          ),
        );
      } else {
        const status = response.status;
        const msg = data.message || JSON.stringify(data);
        alert(`Error [${status}]: ${msg}`);
      }
    } catch (err) {
      console.error("Error accepting assignment:", err);
      alert("An error occurred while accepting the assignment.");
    }
  };

  const handleReject = async (assignmentId: string) => {
    try {
      const response = await fetch(
        `/api/delivery/assignment/${assignmentId}/reject-assignment`,
        {
          method: "POST",
        },
      );
      if (response.ok) {
        alert("Assignment rejected.");
        setAssignments((prev) =>
          prev.filter((a) => a._id?.toString() !== assignmentId),
        );
      } else {
        const data = await response.json();
        alert(data.message || "Failed to reject assignment");
      }
    } catch (err) {
      console.error("Error rejecting assignment:", err);
      alert("An error occurred while rejecting the assignment.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg font-medium">Loading assignments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 p-4">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mt-[120px] mb-4">
          🚚 Delivery Assignments
        </h2>

        {assignments.length === 0 && (
          <p className="text-gray-500">No assignments available.</p>
        )}

        {assignments.map((a, idx) => {
          // safe order reference to avoid runtime null errors
          const order: any = a.order || {};
          const assignmentId = a._id ? a._id.toString() : null;
          const orderIdDisplay = order._id
            ? String(order._id).slice(-6)
            : "N/A";
          const orderStatus = order.status ?? "Pending";
          const fullAddress = order.address?.fullAddress ?? "No address";
          const totalAmount = order.totalAmount ?? 0;

          return (
            <div
              key={assignmentId ?? `assignment-${idx}`}
              className="p-5 bg-white rounded-xl shadow mb-4 border"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold">Order ID: {orderIdDisplay}</p>
                  <p className="text-sm text-gray-500">
                    Job Status: {a.status}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                    orderStatus === "out of delivery"
                      ? "bg-orange-100 text-orange-700"
                      : orderStatus === "delivered"
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {orderStatus}
                </span>
              </div>

              <p className="text-gray-600">{fullAddress}</p>

              <p className="text-green-600">
                <span className="font-semibold">Total: ₹{totalAmount}</span>
              </p>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => assignmentId && handleAccept(assignmentId)}
                  className="bg-green-500 text-white px-6 py-2 rounded cursor-pointer hover:bg-green-600 transition-colors"
                  disabled={!assignmentId || a.status !== "broadcasted"}
                >
                  {a.status === "assigned" ? "Assigned" : "Accept"}
                </button>
                <button
                  onClick={() => assignmentId && handleReject(assignmentId)}
                  className="bg-red-500 text-white px-6 py-2 rounded cursor-pointer hover:bg-red-600 transition-colors"
                  disabled={!assignmentId || a.status !== "broadcasted"}
                >
                  Reject
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DeliveryBoyDashboard;

export async function POST(request: Request, context: any) {
  let params = context?.params;
  if (params && typeof params.then === "function") {
    try { params = await params; } catch { params = {}; }
  }
  // ...use params safely...
  // ...existing code...
}