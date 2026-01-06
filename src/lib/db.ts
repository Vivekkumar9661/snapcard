// import mongoose from "mongoose";

// const mongodbUrl = process.env.MONGODB_URL;

// if (!mongodbUrl) {
//   throw new Error("db error");
// }

// let cached = global.mongoose;
// if (!cached) {
//   cached = global.mongoose = { conn: null, promise: null };
// }

// const connectDb = async () => {
//   if (cached.conn) {
//     return cached.conn;
//   }

//   if (!cached.promise) {
//     cached.promise = mongoose
//       .connect(mongodbUrl)
//       .then((conn) => conn.connection);
//   }

//   try {
//     cached.conn = await cached.promise;
//     return cached.conn;
//   } catch (error) {
//     console.error("DB Error:", error);
//   }
// };

// export default connectDb;
import mongoose from "mongoose";

const MONGODB_URL = process.env.MONGODB_URL;

if (!MONGODB_URL) {
  throw new Error("MONGODB_URL is not defined");
}

// global cache (Next.js hot-reload safe)
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = {
    conn: null,
    promise: null,
  };
}

const connectDb = async () => {
  // already connected
  if (cached.conn) {
    return cached.conn;
  }

  // create new connection
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URL).then((mongooseInstance) => {
      console.log("✅ MongoDB connected to:", mongooseInstance.connection.name);
      return mongooseInstance;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

export default connectDb;
