const { body, validationResult } = require("express-validator");

/**
 * Validate request middleware
 */
const validate = (validations) => {
  return async (req, res, next) => {
    // Execute all validations
    await Promise.all(validations.map((validation) => validation.run(req)));

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: errors.array(),
      });
    }

    next();
  };
};

// Dataset upload validation
const validateDatasetUpload = validate([
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string"),
]);

// Clean dataset validation
const validateCleaningRequest = validate([
  body("operations").isArray().withMessage("Operations must be an array"),
  body("missingValueStrategy")
    .optional()
    .isIn(["remove", "mean", "median", "mode", "zero"])
    .withMessage("Invalid missing value strategy"),
  body("columnsToStandardize")
    .optional()
    .isArray()
    .withMessage("Columns to standardize must be an array"),
]);

// Report validation
const validateReportRequest = validate([
  body("datasetId").isMongoId().withMessage("Invalid dataset ID"),
  body("name").optional().isString().withMessage("Name must be a string"),
  body("visualizations")
    .isArray()
    .withMessage("Visualizations must be an array"),
  body("insights").isArray().withMessage("Insights must be an array"),
]);

// User registration validation
const validateRegistration = [
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),

  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please include a valid email")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  body("organization")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Organization name must be less than 100 characters"),
];

// User login validation
const validateLogin = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please include a valid email")
    .normalizeEmail(),

  body("password").notEmpty().withMessage("Password is required"),
];

// Profile update validation
const validateProfileUpdate = [
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),

  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please include a valid email")
    .normalizeEmail(),

  body("organization")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Organization name must be less than 100 characters"),
];

// Password update validation
const validatePasswordUpdate = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),

  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters")
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error("New password must be different from current password");
      }
      return true;
    }),
];

module.exports = {
  validateDatasetUpload,
  validateCleaningRequest,
  validateReportRequest,
  validateRegistration,
  validateLogin,
  validateProfileUpdate,
  validatePasswordUpdate,
};
