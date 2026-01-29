"use client";

import React, { useEffect, useState } from "react";
import { IDeliveryAssignmentPopulated } from "@/models/deliveryAssignment.model";

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

        console.log("STATUS:", response.status); // 👈 debug
        const text = await response.text(); // 👈 debug
        console.log("RAW RESPONSE:", text); // 👈 debug

        if (!response.ok) {
          let errorMsg = `API Error: ${response.status}`;
          try {
            const errData = JSON.parse(text);
            if (errData.message) errorMsg = errData.message;
            if (errData.stack) console.error("Server Stack:", errData.stack);
          } catch (e) {
            // ignore JSON parse error, use default message
          }
          throw new Error(errorMsg);
        }

        const data = JSON.parse(text);
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

        {assignments.map((a) => (
          <div
            key={a._id?.toString()}
            className="p-5 bg-white rounded-xl shadow mb-4 border"
          >
            <p className="font-semibold">
              Order ID: {a.order._id.toString().slice(-6)}
            </p>

            <p className="text-sm text-gray-500">Status: {a.status}</p>

            <p className="text-gray-600">{a.order.address.fullAddress}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeliveryBoyDashboard;
