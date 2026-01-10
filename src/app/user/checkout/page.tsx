"use client";
import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Building,
  CreditCard,
  Home,
  Loader2,
  LocateFixed,
  MapIcon,
  MapPin,
  Navigation,
  Phone,
  PinIcon,
  Truck,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";

import L, { LatLngExpression } from "leaflet";

import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import axios from "axios";
import { OpenStreetMapProvider } from "leaflet-geosearch";

const MarkerIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/128/684/684908.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const Checkout = () => {
  const router = useRouter();
  const { userData } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  // Sync Redux userData with session on mount
  useEffect(() => {
    async function syncUser() {
      try {
        const res = await axios.get("/api/me");
        if (res.status === 200 && res.data) {
          dispatch({ type: "user/setUserData", payload: res.data });
        }
      } catch (err) {
        // Not logged in or error
      }
    }
    if (!userData) {
      syncUser();
    }
  }, [userData, dispatch]);
  const { subTotal, deliveryFee, finalTotal, cartData } = useSelector(
    (state: RootState) => state.cart
  );
  const [address, setAddress] = useState({
    fullName: "",
    mobile: "",
    city: "",
    state: "",
    pincode: "",
    fullAddress: "",
  });
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "online">("COD");

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition([latitude, longitude]);
        },
        (err) => {
          console.log("location error", err);
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
      );
    }
  }, []);
  useEffect(() => {
    if (userData) {
      setAddress((prev) => ({ ...prev, fullName: userData?.name || "" }));
      setAddress((prev) => ({ ...prev, mobile: userData?.mobile || "" }));
    }
  }, [userData]);

  const DraggableMarker: React.FC = () => {
    const map = useMap();
    useEffect(() => {
      map.setView(position as LatLngExpression, 15, { animate: true });
    }, [position, map]);
    return (
      <Marker
        icon={MarkerIcon}
        position={position as LatLngExpression}
        draggable={true}
        eventHandlers={{
          dragend: (e: L.LeafletEvent) => {
            const marker = e.target as L.Marker;
            const { lat, lng } = marker.getLatLng();
            setPosition([lat, lng]);
          },
        }}
      />
    );
  };

  const handleSearchQuery = async () => {
    setSearchLoading(true);
    if (!searchQuery.trim()) return;

    try {
      const provider = new OpenStreetMapProvider();
      const results = await provider.search({ query: searchQuery });

      if (results && results.length > 0) {
        setSearchLoading(false);
        setPosition([results[0].y, results[0].x]);
      }
    } catch (error) {
      console.log("Search location error:", error);
    }
  };

  useEffect(() => {
    const fetchAddress = async () => {
      if (!position) return;
      try {
        const result = await axios.get(
          `https://nominatim.openstreetmap.org/reverse?lat=${position[0]}&lon=${position[1]}&format=json`
        );
        console.log(result.data);
        setAddress((prev) => ({
          ...prev,
          city: result.data.address.city,
          state: result.data.address.state,
          pincode: result.data.address.postcode,
          fullAddress: result.data.display_name,
        }));
      } catch (error) {
        console.log(error);
      }
    };
    fetchAddress();
  }, [position]);

  const handleCod = async () => {
    // ✅ position check
    if (!position || position.length !== 2) {
      alert("Location not selected");
      return;
    }

    // ✅ user check
    if (!userData?._id) {
      alert("Please login first");
      return;
    }

    // ✅ cart check
    if (!cartData || cartData.length === 0) {
      alert("Cart is empty");
      return;
    }

    try {
      const res = await axios.post("/api/user/order", {
        userId: userData._id,
        item: cartData.map((item) => ({
          grocery: item._id,
          name: item.name,
          price: item.price,
          unit: item.unit,
          quantity: item.quantity,
          image: item.image,
        })),
        totalAmount: finalTotal,
        address: {
          fullName: address.fullName,
          mobile: address.mobile,
          city: address.city,
          state: address.state,
          fullAddress: address.fullAddress,
          pincode: address.pincode,
          latitude: position[0],
          longitude: position[1],
        },
        paymentMethod: "COD",
      });

      // ✅ success check
      if (res.status === 201 || res.status === 200) {
        router.push("/user/order-success");
      }
    } catch (error: any) {
      console.log("ORDER ERROR:", error.response?.data || error.message);
      alert("Order failed. Please try again");
    }
  };

  // online payment
  const handleOnlinePayment = async () => {
    if (!position) {
      return null;
    }
    try {
      const result = await axios.post("/api/user/payment", {
        userId: userData?._id,
        item: cartData.map((item) => ({
          grocery: item._id,
          name: item.name,
          price: item.price,
          unit: item.unit,
          quantity: item.quantity,
          image: item.image,
        })),
        totalAmount: finalTotal,
        address: {
          fullName: address.fullName,
          mobile: address.mobile,
          city: address.city,
          state: address.state,
          fullAddress: address.fullAddress,
          pincode: address.pincode,
          latitude: position[0],
          longitude: position[1],
        },
        paymentMethod,
      });
      window.location.href = result.data.url;
    } catch (error) {
      console.log(error);
    }
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition([latitude, longitude]);
        },
        (err) => {
          console.log("location error", err);
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
      );
    }
  };

  return (
    <div className="w-[92%] md:w-[80%] mx-auto py-10 relative">
      <motion.button
        whileTap={{ scale: 0.97 }}
        className="absolute left-0 top-2 flex items-center gap-2 text-green-700 hover:text-green-800 font-semibold cursor-pointer"
        onClick={() => router.push("/user/cart")}
      >
        <ArrowLeft size={16} />
        <span>Back to Cart</span>
      </motion.button>
      <motion.h1
        initial={{ opacity: 0, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-3xl md:text-4xl font-bold text-green-700 text-center mb-10"
      >
        Checkout
      </motion.h1>

      <div className="grid md:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-md hover:shadow-2xl transition-all duration-300"
        >
          <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-800 mb-5">
            <MapPin className="text-green-700" size={22} />
            Delivery Address
          </h2>
          <div className="space-y-4">
            <div className="relative">
              <User
                className="absolute left-3 top-3 text-green-600"
                size={16}
              />
              <input
                type="text"
                value={address.fullName}
                onChange={(e) =>
                  setAddress((prev) => ({
                    ...prev,
                    fullName: e.target.value,
                  }))
                }
                className="pl-10 w-full border rounded-2xl p-3 text-sm bg-gray-50"
              />
            </div>
            <div className="relative">
              <Phone
                className="absolute left-3 top-3 text-green-600"
                size={16}
              />
              <input
                type="tel"
                value={address.mobile}
                onChange={(e) =>
                  setAddress((prev) => ({
                    ...prev,
                    mobile: e.target.value,
                  }))
                }
                className="pl-10 w-full border rounded-2xl p-3 text-sm bg-gray-50"
              />
            </div>
            <div className="relative">
              <Home
                className="absolute left-3 top-3 text-green-600"
                size={16}
              />
              <input
                type="text"
                value={address.fullAddress}
                placeholder="Full Address"
                onChange={(e) =>
                  setAddress((prev) => ({
                    ...prev,
                    fullAddress: e.target.value,
                  }))
                }
                className="pl-10 w-full border rounded-2xl p-3 text-sm bg-gray-50"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="relative">
                <Building
                  size={16}
                  className="absolute left-3 top-3 text-green-600"
                />
                <input
                  type="text"
                  value={address.city}
                  placeholder="City Name"
                  onChange={(e) =>
                    setAddress((prev) => ({
                      ...prev,
                      city: e.target.value,
                    }))
                  }
                  className="pl-10 w-full border rounded-2xl p-3 text-sm bg-gray-50"
                />
              </div>
              <div className="relative">
                <Navigation
                  className="absolute left-3 top-3 text-green-600"
                  size={16}
                />
                <input
                  type="text"
                  value={address.state}
                  placeholder="State Name"
                  onChange={(e) =>
                    setAddress((prev) => ({
                      ...prev,
                      state: e.target.value,
                    }))
                  }
                  className="pl-10 w-full border rounded-2xl p-3 text-sm bg-gray-50"
                />
              </div>
              <div className="relative">
                <MapIcon
                  className="absolute left-3 top-3 text-green-600"
                  size={16}
                />
                <input
                  type="text"
                  value={address.pincode}
                  placeholder="PinCode No."
                  onChange={(e) =>
                    setAddress((prev) => ({
                      ...prev,
                      pincode: e.target.value,
                    }))
                  }
                  className="pl-10 w-full border rounded-2xl p-3 text-sm bg-gray-50"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <input
                type="text"
                placeholder="Search city or area..."
                className="flex-1 px-4 py-3 text-sm rounded-xl
               border border-gray-300
               focus:ring-2 focus:ring-green-500 focus:border-green-500
               focus:outline-none
               transition-all duration-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              <button
                className="bg-green-600 text-white px-5 py-3 rounded-xl
               hover:bg-green-700 active:scale-95
               transition-all duration-300 font-medium
               shadow-md hover:shadow-lg cursor-pointer"
                onClick={handleSearchQuery}
              >
                {searchLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Search"
                )}
              </button>
            </div>
            <div className="relative mt-6 h-[330px] rounded-xl overflow-hidden border border-gray-200 shadow-inner">
              {position && (
                <MapContainer
                  center={position as LatLngExpression}
                  zoom={13}
                  scrollWheelZoom={true}
                  className="w-full h-full"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <DraggableMarker />
                </MapContainer>
              )}
              <motion.button
                whileTap={{ scale: 0.93 }}
                className="absolute bottom-4 right-4 bg-green-600 text-white shadow-lg rounded-full
                p-3 hover:bg-green-700 transition-all  flex items-center justify-center z-999 cursor-pointer"
                onClick={handleCurrentLocation}
              >
                <LocateFixed size={22} />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* payment mode */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 h-fit"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <CreditCard className="text-green-700" />
            Payment Method
          </h2>
          <div className="space-y-4 mb-6">
            <button
              onClick={() => setPaymentMethod("online")}
              className={`flex items-center gap-3 w-full border rounded-2xl p-3 transition-all
              ${
                paymentMethod === "online"
                  ? "border-green-600 bg-green-50 shadow-sm"
                  : "hover:bg-gray-50"
              }`}
            >
              <CreditCard className="text-green-700" />
              <span className="font-medium text-gray-700">
                Pay Online(stripe)
              </span>
            </button>
            <button
              onClick={() => setPaymentMethod("COD")}
              className={`flex items-center gap-3 w-full border rounded-2xl p-3 transition-all
              ${
                paymentMethod === "COD"
                  ? "border-green-600 bg-green-50 shadow-sm"
                  : "hover:bg-gray-50"
              }`}
            >
              <Truck className="text-green-700" />
              <span className="font-medium text-gray-700">
                Cash On Delivery
              </span>
            </button>
          </div>
          <div className="border-t pt-4 text-gray-800 space-y-2 text-sm sm:text-base">
            <div className="flex justify-between">
              <span className="font-semibold">Subtotal</span>
              <span className="font-bold text-green-700">₹{subTotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Delivery Fee</span>
              <span className="font-bold text-green-700">₹{deliveryFee}</span>
            </div>
            <div className="flex justify-between border-t text-xl pt-2">
              <span className="font-bold  ">Final Total</span>
              <span className="font-bold text-green-700">₹{finalTotal}</span>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.96 }}
            className="w-full mt-6 bg-green-600 text-white py-3 rounded-full hover:bg-green-700
            transition-all font-semibold cursor-pointer"
            onClick={() => {
              if (paymentMethod == "COD") {
                handleCod();
              } else {
                handleOnlinePayment();
              }
            }}
          >
            {paymentMethod == "COD" ? "Place Order" : "Pay & place Order"}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default Checkout;
