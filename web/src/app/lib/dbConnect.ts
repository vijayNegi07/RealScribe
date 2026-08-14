
import mongoose, { Mongoose } from "mongoose";

const globalWithMongoose = global as typeof global & {
  mongoose?: {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
  };
};

if (!globalWithMongoose.mongoose) {
  globalWithMongoose.mongoose = { conn: null, promise: null };
}

const cached = globalWithMongoose.mongoose;

export async function connectDB(): Promise<Mongoose> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {

    
    cached.promise = mongoose.connect(process.env.URI || "")
    .then((mongoose)=>{console.log("Database connected successfully");
      return mongoose})
    .catch((error)=>{ console.log("There is some error while connecting to DB ",error);
     return error})
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export async function getClient() {
  const conn = await connectDB();
  return conn.connection.getClient().db(process.env.DB_NAME);
}



