"use client";
import React, { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Bike, User, UserCog } from "lucide-react";
import axios from "axios";
import { redirect, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const EditRoleMobile = () => {
  const [role, setRole] = useState([
    { id: "admin", label: "Admin", icon: UserCog },
    { id: "user", label: "User", icon: User },
    { id: "deliveryBoy", label: "Delivery Boy", icon: Bike },
  ]);
  const [selectedRole, setSelectedRole] = useState("");
  const [mobile, setMobile] = useState("");
  const { update } = useSession();
  const router = useRouter();
  const handleEdit = async () => {
    try {
      const result = await axios.post("/api/user/edit-role-mobile", {
        role: selectedRole,
        mobile,
      });
      await update({ role: selectedRole });
      router.push("/");
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="flex flex-col min-h-screen p-6 w-full items-center">
      <motion.h1
        initial={{
          opacity: 0,
          y: -20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.6,
        }}
        className="text-3xl md:text-4xl font-extrabold text-green-700 text-center mt-8"
      >
        Select Your Role
      </motion.h1>
      <div className="flex flex-col md:flex-row justify-center items-center gap-6 mt-10">
        {role.map((role) => {
          const Icon = role.icon;
          const isSelected = selectedRole == role.id;
          return (
            <motion.div
              key={role.id}
              whileTap={{ scale: 0.86 }}
              onClick={() => setSelectedRole(role.id)}
              className={`flex flex-col items-center justify-center w-48 h-44 rounded-2xl border-2 transition-all cursor-pointer ${
                isSelected
                  ? "border-green-600 shadow-lg"
                  : "border-gray-300 bg-white hover:border-green-500"
              }`}
            >
              <Icon />
              <span>{role.label}</span>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        transition={{
          duration: 0.6,
          delay: 0.5,
        }}
        className="flex flex-col items-center mt-10"
      >
        <label htmlFor="mobile" className="text-gray-700 font-medium mb-2">
          Enter Your Mobile No.
        </label>
        <input
          type="tel"
          id="mobile"
          className="w-64 md:w-80 px-4 py-3 rounded-xl border border-gray-300
           focus:ring-2 focus:ring-green-500 focus:outline-none text-gray-800"
          placeholder="eg- 9876543210"
          onChange={(e) => setMobile(e.target.value)}
        />
      </motion.div>
      <motion.button
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 0.5,
        }}
        disabled={mobile.length !== 10 || !selectedRole}
        className={`inline-flex items-center gap-2 font-semibold py-3 px-8 rounded-2xl shadow-md transition-all duration-200 w-[200px] mt-20
  ${
    selectedRole && mobile.length === 10
      ? "bg-green-600 text-white hover:bg-green-700 hover:shadow-md active:scale-[0.98] cursor-pointer"
      : "bg-gray-300 text-gray-500 cursor-not-allowed"
  }`}
        onClick={handleEdit}
      >
        Go to Home
        <ArrowRight />
      </motion.button>
    </div>
  );
};

export default EditRoleMobile;
