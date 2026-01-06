"use client";
import { ArrowLeft, Minus, Plus, ShoppingBasket, Trash2 } from "lucide-react";
import Link from "next/link";
import React from "react";
import { AnimatePresence, motion } from "motion/react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import Image from "next/image";
import {
  decreaseQuantity,
  increaseQuantity,
  removeFromCart,
} from "@/redux/cartSlice";
import { useRouter } from "next/navigation";

const Cartpage = () => {
  const { cartData, subTotal, finalTotal, deliveryFee } = useSelector(
    (state: RootState) => state.cart
  );
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  return (
    <div className="w-[95%] sm:w-[90%] md:w-[80%] mx-auto mt-10 mb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-green-700 font-medium
          hover:text-green-800 transition-all duration-200 hover:-translate-x-1"
        >
          <ArrowLeft size={20} />
          <span className="hidden sm:inline">Back to Home</span>
        </Link>
      </div>

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-700 text-center mb-10"
      >
        🛒 Your Shopping Cart
      </motion.h2>
      {cartData.length == 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center justify-center text-center 
  py-24 px-6 bg-white rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)]"
        >
          {/* Icon */}
          <div
            className="w-24 h-24 mb-6 flex items-center justify-center 
  rounded-full bg-green-100 shadow-inner"
          >
            <ShoppingBasket className="w-12 h-12 text-green-600" />
          </div>

          {/* Text */}
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
            Your Cart is Empty
          </h3>
          <p className="text-gray-500 max-w-md mb-8">
            Looks like you haven added anything yet. Start shopping to fill your
            cart with fresh groceries 🛒
          </p>

          {/* Button */}
          <Link
            href="/"
            className="bg-linear-to-r from-green-600 to-green-700 
            text-white px-8 py-3 rounded-full font-semibold
            hover:from-green-700 hover:to-green-800
            shadow-lg hover:shadow-xl hover:-translate-y-0.5
            transition-all duration-300"
          >
            Continue Shopping
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="lg:col-span-2 space-y-5">
            <AnimatePresence>
              {cartData.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="group relative bg-white rounded-2xl p-4 sm:p-5
      border border-gray-100
      shadow-[0_10px_35px_rgba(0,0,0,0.06)]
      hover:shadow-[0_22px_55px_rgba(0,0,0,0.12)]
      transition-all duration-300"
                >
                  <div className="flex gap-4 items-center">
                    {/* Image */}
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-gray-50">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-contain p-3 group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-800 leading-tight">
                        {item.name}
                      </h3>

                      <p className="text-sm text-gray-500 mt-1">
                        ₹{item.price} / item
                      </p>

                      {/* Bottom Row */}
                      <div className="flex items-center justify-between mt-5">
                        {/* Quantity Controller */}
                        <div
                          className="flex items-center gap-3 bg-gray-50
                            px-3 py-1.5 rounded-full border border-gray-200 shadow-sm"
                        >
                          <button
                            className="w-7 h-7 flex items-center justify-center rounded-full
                                 bg-white hover:bg-green-100 transition border border-gray-200"
                            onClick={() => dispatch(decreaseQuantity(item._id))}
                          >
                            <Minus
                              size={15}
                              className="text-green-700 cursor-pointer"
                            />
                          </button>

                          <span className=".min-w-[24px] text-center font-semibold text-gray-800">
                            {item.quantity}
                          </span>

                          <button
                            className="w-7 h-7 flex items-center justify-center rounded-full
                             bg-white hover:bg-green-100 transition border border-gray-200"
                            onClick={() => dispatch(increaseQuantity(item._id))}
                          >
                            <Plus
                              size={15}
                              className="text-green-700 cursor-pointer"
                            />
                          </button>
                        </div>

                        {/* Total Price */}
                        <div className="text-right">
                          <p className="text-xs text-gray-400">Total</p>
                          <p className="text-lg font-bold text-green-700">
                            ₹{Number(item.price) * item.quantity}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* subtle divider */}
                  <div className="absolute inset-x-6 bottom-0 h-px bg-linear-to-r from-transparent via-gray-200 to-transparent opacity-0 group-hover:opacity-100 transition" />
                  <div className="flex  justify-end">
                    <button
                      className="sm:ml-4 mt-3 sm:mt-3 text-red-500 hover:text-red-7000
                    transition-all cursor-pointer"
                      onClick={() => dispatch(removeFromCart(item._id))}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="
            bg-white rounded-2xl p-6 h-fit sticky top-24 flex flex-col
            border border-gray-100
            shadow-[0_12px_40px_rgba(0,0,0,0.08)]
            hover:shadow-[0_20px_60px_rgba(0,0,0,0.14)]
            transition-all duration-300"
          >
            <h2 className="text-lg sm:text-xl text-gray-800 mb-4 font-semibold">
              Order Summary
            </h2>
            <div className="space-y-3 text-gray-700 text-sm sm:text-base">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-green-700 font-semibold">
                  ₹{subTotal}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className="text-green-700 font-semibold">
                  ₹{deliveryFee}
                </span>
              </div>
              <hr className="my-3" />
              <div className="flex justify-between font-bold text-lg sm:text-xl">
                <span>Final Total</span>
                <span className="text-green-700 font-semibold">
                  ₹{finalTotal}
                </span>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="w-full mt-6 bg-green-600 text-white py-3 rounded-full hover:bg-green-700 transition-all font-semibold text-sm sm:text-base cursor-pointer"
              onClick={() => router.push("/user/checkout")}
            >
              Proced to Checkout
            </motion.button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Cartpage;
