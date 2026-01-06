"use client";

import {
  ArrowLeft,
  EyeIcon,
  EyeOff,
  Leaf,
  Loader2,
  LockIcon,
  LogIn,
  Mail,
  User,
} from "lucide-react";
import React, { FormEvent, useState, useEffect } from "react";
import { motion } from "motion/react";
import google from "@/assets/google.png";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { status } = useSession();

  // ✅ already logged in → redirect
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
    }
  }, [status, router]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false, // 🔥 IMPORTANT
    });

    if (res?.error) {
      console.log("Login failed:", res.error);
      setLoading(false);
      return;
    }

    setLoading(false);
    router.push("/");
  };

  if (status === "loading") return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-10 bg-white relative">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl font-extrabold text-green-700"
      >
        Welcome Back
      </motion.h1>

      <p className="text-gray-600 mb-8 flex items-center">
        Login to Snapcart <Leaf className="w-5 h-5 text-green-600" />
      </p>

      <motion.form
        onSubmit={handleLogin}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col gap-5 w-full max-w-sm"
      >
        {/* email */}
        <div className="relative">
          <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
          <input
            type="email"
            placeholder="Enter e-mail"
            className="w-full border border-gray-300 rounded-xl py-3 pl-10 pr-4 text-gray-800 focus:border-green-500 focus:ring-2 focus:ring-green-300 focus:outline-none"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
          />
        </div>

        {/* password */}
        <div className="relative">
          <LockIcon className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Set Strong Password"
            className="w-full border border-gray-300 rounded-xl py-3 pl-10 pr-10 text-gray-800 focus:border-green-500 focus:ring-2 focus:ring-green-300 focus:outline-none"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />

          {showPassword ? (
            <EyeOff
              className="absolute right-3 top-3.5 w-5 h-5 text-gray-500 cursor-pointer"
              onClick={() => setShowPassword(false)}
            />
          ) : (
            <EyeIcon
              className="absolute right-3 top-3.5 w-5 h-5 text-gray-500 cursor-pointer"
              onClick={() => setShowPassword(true)}
            />
          )}
        </div>

        {/* button */}
        {(() => {
          const formValidation = email !== "" && password !== "";

          return (
            <button
              className={`w-full font-semibold py-3 rounded-xl transition-all duration-200 shadow-md inline-flex items-center justify-center gap-2 ${
                formValidation
                  ? "bg-green-600 hover:bg-green-700 text-white cursor-pointer"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              disabled={!formValidation || loading}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Login"}
            </button>
          );
        })()}

        <div className="flex items-center gap-2 text-gray-400 text-sm mt-2">
          <span className="flex-1 h-px bg-gray-400"></span>
          or
          <span className="flex-1 h-px bg-gray-400"></span>
        </div>

        {/* Google login */}
        <div
          className="w-full flex items-center justify-center gap-3 border border-gray-300 hover:bg-gray-50 py-3 rounded-xl text-gray-700 font-medium transition-all duration-200 cursor-pointer"
          onClick={() => signIn("google", { callbackUrl: "/" })}
        >
          <Image src={google} alt="googleimage" width={20} height={20} />
          Continue with Google
        </div>
      </motion.form>

      <p
        className="text-gray-600 mt-6 text-sm flex items-center gap-1"
        onClick={() => router.push("/register")}
      >
        Want to Create an Account <LogIn className="w-4 h-4" />{" "}
        <span className="text-green-600 cursor-pointer">Sign up</span>
      </p>
    </div>
  );
};

export default Login;
