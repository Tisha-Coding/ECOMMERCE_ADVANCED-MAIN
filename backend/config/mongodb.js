import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const uri =
      process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/e_com";

    // Basic validation to avoid crashing on bad URIs
    if (
      !uri.startsWith("mongodb://") &&
      !uri.startsWith("mongodb+srv://")
    ) {
      console.error(
        'Invalid MONGODB_URI. Expected to start with "mongodb://" or "mongodb+srv://". Got:',
        uri
      );
      console.error(
        "Server will continue to run, but database features will be disabled until this is fixed."
      );
      return;
    }

    mongoose.connection.on("connected", () => {
      console.log("DB Connected");
    });

    await mongoose.connect(uri);
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err.message);
    console.error(
      "Server will continue to run, but database features will be disabled until MongoDB is reachable."
    );
  }
};

export default connectDB;