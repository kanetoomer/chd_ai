const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    console.log("Connecting to MongoDB with URI:", mongoURI);
    await mongoose.connect(mongoURI);

    console.log("Connecting to MongoDB with URI:", process.env.MONGO_URI);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
