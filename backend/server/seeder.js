const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGODB_URI);

// Create initial admin user
const createAdmin = async () => {
  try {
    // Check if admin already exists
    const adminExists = await User.findOne({ email: "admin@example.com" });

    if (adminExists) {
      console.log("Admin user already exists");
      return;
    }

    // Create admin user
    const admin = await User.create({
      name: "Admin User",
      email: "admin@example.com",
      password: "password123",
      role: "admin",
      organization: "Grand Canyon University",
    });

    console.log("Admin user created:", admin.email);
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    mongoose.disconnect();
  }
};

// Create initial test user
const createTestUser = async () => {
  try {
    // Check if test user already exists
    const userExists = await User.findOne({ email: "user@example.com" });

    if (userExists) {
      console.log("Test user already exists");
      return;
    }

    // Create test user
    const user = await User.create({
      name: "Test User",
      email: "user@example.com",
      password: "password123",
      role: "user",
      organization: "Test Organization",
    });

    console.log("Test user created:", user.email);
  } catch (error) {
    console.error("Error creating test user:", error);
  } finally {
    mongoose.disconnect();
  }
};

// Check command line arguments
if (process.argv[2] === "-a") {
  createAdmin();
} else if (process.argv[2] === "-u") {
  createTestUser();
} else if (process.argv[2] === "-b") {
  // Create both admin and test user
  Promise.all([createAdmin(), createTestUser()])
    .then(() => console.log("Admin and test users created"))
    .catch((err) => console.error("Error creating users:", err))
    .finally(() => mongoose.disconnect());
} else {
  console.log("Please specify an option:");
  console.log("  -a: Create admin user");
  console.log("  -u: Create test user");
  console.log("  -b: Create both admin and test user");
  mongoose.disconnect();
}
