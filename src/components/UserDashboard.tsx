import React from "react";
import HeroSeaction from "./HeroSeaction";
import CategorySlider from "./CategorySlider";
import GroceryItemCard from "./GroceryItemCard";
import connectDb from "@/lib/db";
import Grocery from "@/models/grocery.model";

const UserDashboard = async () => {
  await connectDb();

  const groceries = await Grocery.find({}).lean();
  const plainGrocery = JSON.parse(JSON.stringify(groceries));

  return (
    <>
      <HeroSeaction />
      <CategorySlider />
      <div className="w-[90%] md:w-[80%] mx-auto mt-10">
        <h2 className="text-2xl md:text-3xl font-bold text-green-700 mb-6 text-center">
          popular Grocery Items
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {plainGrocery.map((item: any) => (
            <GroceryItemCard key={item._id} item={item} />
          ))}
        </div>
      </div>
    </>
  );
};

export default UserDashboard;
