"use client";
import { Iorder } from "@/models/order.model";
import React, { useState } from "react";
import { motion } from "motion/react";
import {
  ChevronDown,
  ChevronUp,
  CreditCard,
  MapPin,
  Package,
  Truck,
} from "lucide-react";
import Image from "next/image";

const UserOrderCard = ({ order }: { order: Iorder }) => {
  const [expanded, setExpanded] = useState(false);
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "out of delivery":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "delivered":
        return "bg-green-100 text-green-700 border-green-300";

      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white  rounded-2xl border border-gray-100 shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden "
    >
      <div
        className="flex flex-col md:flex-row justify-between items-start
        md:items-center gap-3 border-b border-gray-100 px-5 py-4 bg-linear-to-r from-green-50 to-white"
      >
        <div className="">
          <h3 className="text-lg font-semibold text-gray-800 ">
            order{" "}
            <span className="text-green-700 font-bold">
              #{order?._id?.toString()?.slice(-6)}
            </span>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(order.createdAt!).toLocaleString()}
            </p>
          </h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full border
                ${
                  order.isPaid
                    ? "bg-green-100 text-green-700 border-green-300"
                    : "bg-red-100 text-red-700 border-red-300"
                }`}
          >
            {order.isPaid ? "paid" : "unpaid"}
          </span>

          <span
            className={`px-3 py-1 text-xs font-semibold border rounded-full ${getStatusColor(
              order.status
            )}`}
          >
            {order.status}
          </span>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {order.paymentMethod === "COD" ? (
          <div className="flex items-center gap-2 text-gray-700 text-sm">
            <Truck size={16} className="text-green-600" />
            Cash on Delivery
          </div>
        ) : (
          <div className="flex items-center gap-2 text-gray-700 text-sm">
            <CreditCard size={16} className="text-green-600" />
            Online Payment
          </div>
        )}
        <div className="flex items-center gap-2 text-gray-700 text-sm">
          <MapPin size={16} className="text-green-700" />
          <span className="truncate"> {order.address.fullAddress}</span>
        </div>
        <div className="border-t border-gray-200 pt-4">
          <button
            onClick={() => setExpanded((prev) => !prev)}
            className="flex w-full items-center justify-between rounded-xl 
    px-4 py-3 text-sm font-medium text-gray-700 
    hover:bg-green-50 hover:text-green-700 transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Package size={16} className="text-green-600" />
              <span>
                {expanded
                  ? "Hide Order Items"
                  : `View ${order.item.length} Items`}
              </span>
            </div>

            <span className="text-xs text-green-600">
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </span>
          </button>

          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: expanded ? "auto" : 0,
              opacity: expanded ? 1 : 0,
            }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-3">
              {order.item.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center bg-gray-50 rounded-2xl px-3 py-2 hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-3">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={48}
                      height={48}
                      className=" rounded-2xl object-cover border border-gray-200"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.quantity} X {item.unit}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-green-800">
                    ₹{Number(item.price) * item.quantity}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
        <div className="border-t pt-3 flex justify-between items-center text-sm font-semibold text-gray-800">
          <div className="flex items-center gap-2 text-gray-700 text-sm">
            <Truck size={16} className="text-green-600" />
            <span>
              Delivery:{" "}
              <span className="text-green-600 font-semibold">
                {order.status}
              </span>
            </span>
          </div>
          <div className="text-green-600">
            Total: <span>₹{order.totalAmount}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default UserOrderCard;
