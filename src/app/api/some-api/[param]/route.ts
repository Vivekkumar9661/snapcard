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
    const socket = getSocket();

    socket.on("connect", () => {
      console.log("Socket connected");
    });

    const onNewAssignment = (data: any) => {
      console.log("🔔 New Delivery Assignment:", data);
      alert(`📦 New Delivery Assignment: Status ${data.status || "Pending"}`);

      const newAssignment: any = {
        _id: data.assignmentId,
        status: "broadcasted",
        broadcastedTo: [],
        assignedTo: null,
        acceptedAt: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        order: {
          _id: data.orderId,
          address: data.address,
          totalAmount: data.totalAmount,
          status: data.orderStatus || "pending",
          item: [],
        },
      };

      setAssignments((prev) => [newAssignment, ...prev]);
    };

    const onOrderUpdated = (data: any) => {
      console.log("🔔 Order Status Updated:", data);
      setAssignments((prev) =>
        prev.map((a) => {
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
        { method: "POST" },
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
        { method: "POST" },
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
};

export default DeliveryBoyDashboard;
