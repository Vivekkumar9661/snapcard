// "use client";
// import { Iorder } from "@/models/order.model";
// import React, { useState } from "react";
// import { motion } from "motion/react";
// import {
//   CreditCard,
//   MapPin,
//   Package,
//   Phone,
//   User,
//   ChevronUp,
//   ChevronDown,
//   Truck,
// } from "lucide-react";
// import Image from "next/image";
// import axios from "axios";

// const AdminOrderCard = ({ order }: { order: Iorder }) => {
//   //const statusOptions = ["panding", "out of delivery"];
//   const [expanded, setExpanded] = useState(false);
//   const updateStatus = async (orderId: string, status: string) => {
//     console.log("SENDING ORDER ID:", orderId);
//     console.log("SENDING STATUS:", status);

//     try {
//       const res = await axios.post(
//         `/api/admin/update-order-status/${orderId}`,
//         { status }
//       );

//       console.log("SUCCESS:", res.data);
//     } catch (error: any) {
//       if (axios.isAxiosError(error)) {
//         console.log("AXIOS STATUS:", error.response?.status);
//         console.log("AXIOS MESSAGE:", error.response?.data);
//       } else {
//         console.log("UNKNOWN ERROR:", error);
//       }
//     }
//   };

//   return (
//     <motion.div
//       key={order._id?.toString()}
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.4 }}
//       className="bg-white shadow-md hover:shadow-lg border border-gray-100 rounded-2xl p-6 transition-all "
//     >
//       <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
//         <div className="space-y-1">
//           <p className="text-lg font-bold flex items-center gap-2 text-green-700">
//             <Package size={20} />
//             Order #{order._id?.toString().slice(-6)}
//           </p>
//           <span
//             className={`inline-block text-xs font-semibold px-3 py-1 rounded-full border
//             ${
//               order.isPaid
//                 ? "bg-green-100 text-green-700 border-green-300"
//                 : "bg-red-100 text-red-700 border-red-300"
//             }`}
//           >
//             {order.isPaid ? "paid" : "unpaid"}
//           </span>
//           <p className="text-gray-500 text-sm">
//             {new Date(order.createdAt!).toLocaleString()}
//           </p>
//           <div className="mt-3 space-y-1 text-gray-700 text-sm">
//             <p className="flex items-center gap-2 font-semibold">
//               <User size={16} className="text-green-700" />
//               <span>{order?.address.fullName}</span>
//             </p>
//             <p className="flex items-center gap-2 font-semibold">
//               <Phone size={16} className="text-green-700" />
//               <span>{order?.address.mobile}</span>
//             </p>
//             <p className="flex items-center gap-2 font-semibold">
//               <MapPin size={16} className="text-green-700" />
//               <span>{order?.address.fullAddress}</span>
//             </p>
//           </div>
//           <p className="flex items-center gap-2 text-sm mt-3 text-gray-700">
//             <CreditCard size={16} className="text-green-700" />
//             <span>
//               {order.paymentMethod == "COD"
//                 ? "cash on Delivery"
//                 : "online Payment"}
//             </span>
//           </p>
//         </div>
//         <div className="flex flex-col items-start md:items-end gap-2">
//           <span
//             className={`text-xs font-semibold px-3 py-1 rounded-full capitalize
//                 ${
//                   order.status === "deliverd"
//                     ? "bg-green-100 text-green-700"
//                     : order.status == "pending"
//                     ? "bg-yellow-100 text-yellow-700"
//                     : "bg-blue-100 text-blue-700"
//                 }`}
//           >
//             {order.status}
//           </span>
//           <select
//             value={order.status}
//             onChange={(e) => {
//               if (!order._id) return;
//               updateStatus(order._id.toString(), e.target.value);
//             }}
//             className="border border-gray-300 rounded-2xl px-3 py-1 text-sm shadow-sm
//   hover:border-green-400 transition focus:ring-2 focus:ring-green-500 outline-none cursor-pointer"
//           >
//             <option value="pending">PENDING</option>
//             <option value="out of delivery">OUT OF DELIVERY</option>
//           </select>
//         </div>
//       </div>
//       <div className="border-t border-gray-200 mt-4">
//         <button
//           onClick={() => setExpanded((prev) => !prev)}
//           className="flex w-full items-center justify-between rounded-xl
//     px-4 py-3 text-sm font-medium text-gray-700
//     hover:bg-green-50 hover:text-green-700 transition cursor-pointer"
//         >
//           <div className="flex items-center gap-2">
//             <Package size={16} className="text-green-600" />
//             <span>
//               {expanded
//                 ? "Hide Order Items"
//                 : `View ${order.item.length} Items`}
//             </span>
//           </div>

//           <span className="text-xs text-green-600">
//             {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
//           </span>
//         </button>

//         <motion.div
//           initial={{ height: 0, opacity: 0 }}
//           animate={{
//             height: expanded ? "auto" : 0,
//             opacity: expanded ? 1 : 0,
//           }}
//           transition={{ duration: 0.3 }}
//           className="overflow-hidden"
//         >
//           <div className="mt-3 space-y-3">
//             {order.item.map((item, index) => (
//               <div
//                 key={index}
//                 className="flex justify-between items-center bg-gray-50 rounded-2xl px-3 py-2 hover:bg-gray-100 transition"
//               >
//                 <div className="flex items-center gap-3">
//                   <Image
//                     src={item.image}
//                     alt={item.name}
//                     width={48}
//                     height={48}
//                     className=" rounded-2xl object-cover border border-gray-200"
//                   />
//                   <div>
//                     <p className="text-sm font-medium text-gray-800">
//                       {item.name}
//                     </p>
//                     <p className="text-xs text-gray-500">
//                       {item.quantity} X {item.unit}
//                     </p>
//                   </div>
//                 </div>
//                 <p className="text-sm font-semibold text-green-800">
//                   ₹{Number(item.price) * item.quantity}
//                 </p>
//               </div>
//             ))}
//           </div>
//         </motion.div>
//       </div>
//       <div className="border-t pt-3 mt-3 flex justify-between items-center text-sm font-semibold text-gray-800">
//         <div className="flex items-center gap-2 text-gray-700 text-sm">
//           <Truck size={16} className="text-green-600" />
//           <span>
//             Delivery:{" "}
//             <span className="text-green-600 font-semibold">{order.status}</span>
//           </span>
//         </div>
//         <div className="text-green-600">
//           Total: <span>₹{order.totalAmount}</span>
//         </div>
//       </div>
//     </motion.div>
//   );
// };

// export default AdminOrderCard;

"use client";
import { Iorder } from "@/models/order.model";
import React, { useState } from "react";
import { motion } from "motion/react";
import {
  CreditCard,
  MapPin,
  Package,
  Phone,
  User,
  ChevronUp,
  ChevronDown,
  Truck,
} from "lucide-react";
import Image from "next/image";
import axios from "axios";

const AdminOrderCard = ({ order }: { order: Iorder }) => {
  const [expanded, setExpanded] = useState(false);

  const updateStatus = async (orderId: string, status: string) => {
    console.log("SENDING ORDER ID:", orderId);
    console.log("SENDING STATUS:", status);

    try {
      const res = await axios.post(
        `/api/admin/update-order-status/${orderId}`,
        { status }
      );

      console.log("SUCCESS:", res.data);
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        console.log("AXIOS STATUS:", error.response?.status);
        console.log("AXIOS MESSAGE:", error.response?.data);
      } else {
        console.log("UNKNOWN ERROR:", error);
      }
    }
  };

  return (
    <motion.div
      key={order._id?.toString()}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white shadow-md hover:shadow-lg border border-gray-100 rounded-2xl p-6 transition-all "
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="space-y-1">
          <p className="text-lg font-bold flex items-center gap-2 text-green-700">
            <Package size={20} />
            Order #{order._id?.toString().slice(-6)}
          </p>

          <span
            className={`inline-block text-xs font-semibold px-3 py-1 rounded-full border
            ${
              order.isPaid
                ? "bg-green-100 text-green-700 border-green-300"
                : "bg-red-100 text-red-700 border-red-300"
            }`}
          >
            {order.isPaid ? "paid" : "unpaid"}
          </span>

          <p className="text-gray-500 text-sm">
            {new Date(order.createdAt!).toLocaleString()}
          </p>

          <div className="mt-3 space-y-1 text-gray-700 text-sm">
            <p className="flex items-center gap-2 font-semibold">
              <User size={16} className="text-green-700" />
              <span>{order.address.fullName}</span>
            </p>
            <p className="flex items-center gap-2 font-semibold">
              <Phone size={16} className="text-green-700" />
              <span>{order.address.mobile}</span>
            </p>
            <p className="flex items-center gap-2 font-semibold">
              <MapPin size={16} className="text-green-700" />
              <span>{order.address.fullAddress}</span>
            </p>
          </div>

          <p className="flex items-center gap-2 text-sm mt-3 text-gray-700">
            <CreditCard size={16} className="text-green-700" />
            <span>
              {order.paymentMethod === "COD"
                ? "cash on Delivery"
                : "online Payment"}
            </span>
          </p>
        </div>

        <div className="flex flex-col items-start md:items-end gap-2">
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full capitalize
              ${
                order.status === "deliverd"
                  ? "bg-green-100 text-green-700"
                  : order.status === "pending"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-blue-100 text-blue-700"
              }`}
          >
            {order.status}
          </span>

          <select
            value={order.status}
            onChange={(e) => {
              if (!order._id) return;

              const newStatus = e.target.value.toLowerCase();
              if (newStatus === order.status) return;

              updateStatus(order._id!.toString(), newStatus);
            }}
            className="border border-gray-300 rounded-2xl px-3 py-1 text-sm shadow-sm 
            hover:border-green-400 transition focus:ring-2 focus:ring-green-500 outline-none cursor-pointer"
          >
            <option value="pending">PENDING</option>
            <option value="out of delivery">OUT FOR DELIVERY</option>
          </select>
        </div>
      </div>

      <div className="border-t border-gray-200 mt-4">
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
                    className="rounded-2xl object-cover border border-gray-200"
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

      <div className="border-t pt-3 mt-3 flex justify-between items-center text-sm font-semibold text-gray-800">
        <div className="flex items-center gap-2 text-gray-700 text-sm">
          <Truck size={16} className="text-green-600" />
          <span>
            Delivery:{" "}
            <span className="text-green-600 font-semibold">{order.status}</span>
          </span>
        </div>
        <div className="text-green-600">
          Total: <span>₹{order.totalAmount}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminOrderCard;
