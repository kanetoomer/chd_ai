const errorHandler = (err, req, res, next) => {
  // Log error for server-side debugging
  console.error(err.stack);

  // Default error status and message
  let status = err.statusCode || 500;
  let message = err.message || "Something went wrong";

  // Handle different types of errors
  if (err.name === "ValidationError") {
    status = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
  } else if (err.name === "CastError") {
    status = 400;
    message = "Invalid ID format";
  } else if (err.code === 11000) {
    status = 400;
    message = "Duplicate field value entered";
  }

  // Send error response
  res.status(status).json({
    success: false,
    message,
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

module.exports = errorHandler;
