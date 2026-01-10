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
import React, { useState } from "react";
import { motion } from "motion/react";
import google from "@/assets/google.png";
import Image from "next/image";
import axios from "axios";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

type propType = {
  previousStep: (s: number) => void;
};

const RegisterFrom = ({ previousStep }: propType) => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await axios.post("/api/auth/register", {
        name,
        email,
        password,
      });
      router.push("/login");
    } catch (error: any) {
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError("Register failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-10 bg-white relative">
      {error && (
        <div className="mb-4 text-red-600 font-semibold bg-red-100 border border-red-300 rounded p-2 w-full max-w-sm text-center">
          {error}
        </div>
      )}
      <div
        className="absolute top-6 left-6 flex items-center gap-2 text-green-700 hover:text-green-800 transition-colors cursor-pointer"
        onClick={() => previousStep(1)}
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">Back</span>
      </div>

      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl font-extrabold text-green-700"
      >
        Create Account
      </motion.h1>

      <p className="text-gray-600 mb-8 flex items-center">
        Join Snapcart today <Leaf className="w-5 h-5 text-green-600" />
      </p>

      <motion.form
        onSubmit={handleRegister}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col gap-5 w-full max-w-sm"
      >
        {/* name */}
        <div className="relative">
          <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Your name"
            className="w-full border border-gray-300 rounded-xl py-3 pl-10 pr-4 text-gray-800 focus:border-green-500 focus:ring-2 focus:ring-green-300 focus:outline-none"
            onChange={(e) => setName(e.target.value)}
            value={name}
          />
        </div>

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
          const formValidation = name !== "" && email !== "" && password !== "";

          return (
            <button
              className={`w-full font-semibold py-3 rounded-xl transition-all duration-200 shadow-md inline-flex items-center justify-center gap-2 ${
                formValidation
                  ? "bg-green-600 hover:bg-green-700 text-white  cursor-pointer"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              disabled={!formValidation || loading}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Register"
              )}
            </button>
          );
        })()}

        <div className="flex items-center gap-2 text-gray-400 text-sm mt-2">
          <span className="flex-1 h-px bg-gray-400"></span>
          or
          <span className="flex-1 h-px bg-gray-400"></span>
        </div>

        <div
          className="w-full flex items-center justify-center gap-3 border border-gray-300 hover:bg-gray-50 py-3 rounded-xl text-gray-700 font-medium transition-all duration-200 cursor-pointer"
          onClick={() => signIn("google", { callbackUrl: "/" })}
        >
          <Image src={google} alt="googleimage" width={20} height={20} />
          Continue with Google
        </div>
      </motion.form>

      <p
        className="text-gray-600 mt-6 text-sm flex items-center gap-1 "
        onClick={() => router.push("/login")}
      >
        Already have an account? <LogIn className="w-4 h-4" />{" "}
        <span className="text-green-600 cursor-pointer">Sing in</span>{" "}
      </p>
    </div>
  );
};

export default RegisterFrom;
