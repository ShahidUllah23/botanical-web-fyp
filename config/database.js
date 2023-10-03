const mongoose = require("mongoose");
const DB_URI ="mongodb+srv://shahidofficial:shahidkhan23@cluster0.um9mjkh.mongodb.net/Ecommerce";

const connectDatabase = async () => {
  try {
    await mongoose.connect(DB_URI);
    console.log("MongoDB connected successfully with server.");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    console.log(`Shutting down server Due to Unhandled Promise Rejection`);

    server.close(() => {
      process.exit(1);
    });
  }
};

module.exports = connectDatabase;
