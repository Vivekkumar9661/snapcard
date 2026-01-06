import { Connection } from "mongoose";

declare global {
  var mongoose: {
    conn: Conneaction | null;
    promise: Promise<Connection> | null;
  };
}

export {};
// import mongoose from "mongoose";

// declare global {
//   // allow global `var`
//   var mongoose: {
//     conn: mongoose.Connection | null;
//     promise: Promise<typeof mongoose> | null;
//   };
// }

// export {};
