"use client";
import { Iorder } from "@/models/order.model";
import axios from "axios";
import { ArrowLeft, PackageSearch } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import UserOrderCard from "@/components/UserOrderCard";

const MyOrderPage = () => {
  const router = useRouter();
  const [order, setOrder] = useState<Iorder[]>();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const getMyOrder = async () => {
      try {
        const result = await axios.get("/api/user/my-order");
        setOrder(result.data);
        setLoading(false);
        //console.log(result);
      } catch (error) {
        console.log(error);
      }
    };
    getMyOrder();
  }, []);
  if (loading) {
    <div className="flex items-center justify-center min-h-[50vh] text-gray-800">
      Loading...
    </div>;
  }
  return (
    <div className="bg-linear-to-b from-white to-green-100 min-h-screen w-full">
      <div className="max-w-3xl mx-auto px-4 pt-16 pb-10 relative">
        <div
          className="fixed top-0 left-0 w-full backdrop-blur-2xl bg-white/70 shadow-sm 
            border-b z-50"
        >
          <div className="max-w-3xl mx-auto flex items-center gap-4 px-4 py-3">
            <button
              onClick={() => router.push("/")}
              className="p-2 bg-gray-100 rounded-full hover:bg-gray-400 active:scale-95 transition"
            >
              <ArrowLeft size={24} className="text-green-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-800">My Order</h1>
          </div>
        </div>
        {order?.length == 0 ? (
          <div className="pt-20 flex flex-col items-center text-center">
            <PackageSearch size={70} className="text-green-700 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700">
              No ordder Found
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Start shopping to view your order here.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-6">
            {order?.map((order, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <UserOrderCard order={order} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrderPage;
