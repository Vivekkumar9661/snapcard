"use client";
import { AnimatePresence } from "framer-motion";
import { Leaf, ShoppingBasket, Smartphone, Truck } from "lucide-react";
import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import { getSocket } from "@/lib/socket";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

const HeroSeaction = () => {
  const slide = [
    {
      id: 1,
      icon: (
        <Leaf className="w-20 h-20 sm:h-28 sm:w-28 text-green-400 drop-shadow-2xl" />
      ),
      title: "Fresh Organic Groceries 🥦",
      subtitles:
        "Farm-fresh fruits, vegetables, and essentials delivered to your home.",
      btnText: "Shop Now",
      bg: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=774&auto=format&fit=crop",
    },
    {
      id: 2,
      icon: (
        <Truck className="w-20 h-20 sm:h-28 sm:w-28 text-yellow-400 drop-shadow-xl" />
      ),
      title: "Fast & Reliable Delivery 🚚",
      subtitles: "We ensure your groceries reach your doorstep in no time.",
      btnText: "Order Now",
      bg: "https://images.unsplash.com/photo-1617347454431-f49d7ff5c3b1?q=80&w=2015&auto=format&fit=crop",
    },
    {
      id: 3,
      icon: (
        <Smartphone className="w-20 h-20 sm:h-28 sm:w-28 text-blue-400 drop-shadow-xl" />
      ),
      title: "Shop Anytime Anywhere 📱",
      subtitles: "Easy and seamless online grocery shopping experience.",
      btnText: "Get Started",
      bg: "https://images.unsplash.com/photo-1498579397066-22750a3cb424?q=80&w=870&auto=format&fit=crop",
    },
  ];

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slide.length);
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-[98%] mx-auto mt-32 h-[90vh] rounded-3xl overflow-hidden shadow-2xl">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.8, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <Image
            src={slide[current].bg}
            fill
            alt="slide"
            priority
            className="object-cover scale-105"
          />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"></div>
        </motion.div>
      </AnimatePresence>

      {/* Center Content */}
      <div className="absolute inset-0 flex items-center justify-center text-white px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="flex flex-col items-center justify-center gap-6 max-w-3xl text-center"
        >
          <div className="bg-white/10 backdrop-blur-xl p-6 rounded-full shadow-lg border border-white/20">
            {slide[current].icon}
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight drop-shadow-[0_6px_12px_rgba(0,0,0,0.55)]">
            {slide[current].title}
          </h1>

          <p className="text-lg sm:text-xl text-gray-200 max-w-2xl">
            {slide[current].subtitles}
          </p>

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className="mt-4 bg-white text-green-700 hover:bg-green-100 px-10 py-3 rounded-full 
            font-semibold shadow-xl border border-white/40 transition-all duration-300 flex items-center gap-2"
          >
            <ShoppingBasket className="w-5 h-5" />
            {slide[current].btnText}
          </motion.button>
        </motion.div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
        {slide.map((_, index) => (
          <button
            key={index}
            className={`h-3 rounded-full transition-all duration-300 ${
              index === current
                ? "bg-white w-8 shadow-md"
                : "bg-white/50 w-3 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSeaction;
