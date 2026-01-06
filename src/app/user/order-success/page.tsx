"use client";
import React from "react";
import { motion } from "motion/react";
import { ArrowRight, CheckCircle, Package } from "lucide-react";
import Link from "next/link";

const OrderSuccess = () => {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center bg-linear-to-b
    from-green-50 to-white"
    >
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", damping: 10, stiffness: 100 }}
        className="relative"
      >
        <CheckCircle className="text-green-700 w-24 h-24 md:w-28 md:h-28" />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.4, 0.15, 0.4], scale: [1, 0.95, 1] }}
          transition={{
            repeat: Infinity,
            duration: 1.8,
            ease: "easeInOut",
          }}
          className="
                absolute inset-0
                bg-green-500/10
                rounded-xl
                z-40
                    "
        />
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="text-3xl md:text-4xl font-bold text-green-800 mt-6"
      >
        Order Placed Successfully
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="text-gray-600 mt-3 text-sm md:text-base max-w-md"
      >
        Thank you for shoping with us! Your order has been placed and is beign
        processed. You can track its progress in your
        <span className="font-semibold text-green-700"> My Order</span>section
      </motion.p>
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: [0, -10, 0], opacity: 1 }}
        transition={{
          delay: 1,
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="mt-10"
      >
        <Package className="w-16 h-16 md:w-20 md:h-20 text-green-600" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          delay: 1.2,
          duration: 0.4,
          ease: "easeOut",
        }}
        className="mt-12 flex justify-center "
      >
        <Link href="/user/my-order">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.93 }}
            className="
                    flex items-center gap-2
                    bg-green-600 hover:bg-green-700
                    text-white text-base font-semibold
                    px-8 py-3 rounded-full
                    shadow-lg hover:shadow-xl
                    transition-all duration-200 cursor-pointer
                    "
          >
            Go to My Order Page
            <ArrowRight size={16} />
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
};

export default OrderSuccess;
