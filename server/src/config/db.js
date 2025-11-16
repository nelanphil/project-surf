import mongoose from "mongoose";

const CONNECTION_OPTIONS = {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 10000,
  connectTimeoutMS: 10000,
  maxPoolSize: 10,
  bufferCommands: false,
  retryWrites: true,
  heartbeatFrequencyMS: 10000,
};

const getMongoUri = () => {
  const isProduction = process.env.NODE_ENV === "production";
  const uri = isProduction
    ? process.env.MONGO_URI_PRODUCTION
    : process.env.MONGO_URI_DEVELOPMENT;

  if (!uri) {
    const target = isProduction
      ? "MONGO_URI_PRODUCTION"
      : "MONGO_URI_DEVELOPMENT";
    throw new Error(
      `Missing MongoDB connection string. Did you set ${target} in your .env file?`
    );
  }

  return uri;
};

export const connectDB = async () => {
  try {
    const mongoUri = getMongoUri();
    const connection = await mongoose.connect(mongoUri, CONNECTION_OPTIONS);

    const envLabel =
      process.env.NODE_ENV === "production" ? "production" : "development";
    console.log(
      `MongoDB (${envLabel}) connected: ${connection.connection.host}`
    );
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
};
