"use client";
import React, { Suspense } from "react";
import { motion } from "motion/react";
import { ArrowRight, CheckCircle, Package } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import { Loader2 } from "lucide-react";

export const dynamic = "force-dynamic"; // disables prerendering for this page

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [verificationStatus, setVerificationStatus] = useState<
    "idle" | "verifying" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (sessionId && verificationStatus === "idle") {
      const verifyPayment = async () => {
        setVerificationStatus("verifying");
        try {
          const res = await axios.post("/api/user/verify-payment", {
            session_id: sessionId,
          });
          if (res.status === 200) {
            setVerificationStatus("success");
          } else {
            setVerificationStatus("error");
            setErrorMessage("Payment verification failed.");
          }
        } catch (error: any) {
          console.error("Verification error:", error);
          setVerificationStatus("error");
          setErrorMessage(
            error.response?.data?.message || "Payment verification failed.",
          );
        }
      };
      verifyPayment();
    }
  }, [sessionId, verificationStatus]);

  return (
    <div
      className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center bg-linear-to-b
    from-green-50 to-white"
    >
      {verificationStatus === "verifying" && (
        <div className="absolute inset-0 bg-white/80 z-50 flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-green-600 animate-spin mb-4" />
          <p className="text-lg font-medium text-green-800">
            Verifying your payment...
          </p>
        </div>
      )}

      {verificationStatus === "error" ? (
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-red-500 mb-4"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-24 h-24 mx-auto"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          </motion.div>
          <h1 className="text-3xl font-bold text-red-600 mb-2">
            Payment Verification Failed
          </h1>
          <p className="text-gray-600 mb-6">{errorMessage}</p>
          <Link href="/user/checkout">
            <button className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 transition">
              Return to Checkout
            </button>
          </Link>
        </div>
      ) : (
        <>
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
            Thank you for shoping with us! Your order has been placed and is
            beign processed. You can track its progress in your
            <span className="font-semibold text-green-700"> My Order</span>{" "}
            section
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
        </>
      )}
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
