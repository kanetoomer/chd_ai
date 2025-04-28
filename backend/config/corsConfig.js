const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests from the frontend or API development tools
    const allowedOrigins = [
      "http://localhost:5173", // For local dev
      "https://chd-ai.onrender.com", // Your frontend production URL
    ];

    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-auth-token"],
  credentials: true,
  maxAge: 86400, // 24 hours
};

module.exports = corsOptions;
