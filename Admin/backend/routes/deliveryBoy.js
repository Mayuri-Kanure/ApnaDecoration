const express = require("express");
const { body } = require("express-validator");
const deliveryBoyController = require("../controllers/deliveryBoyController");
const earningsController = require("../controllers/earningsController");
const withdrawalController = require("../controllers/withdrawalController");
const settingsController = require("../controllers/settingsController");
const { protectDeliveryBoy } = require("../middleware/deliveryAuth");
const rateLimit = require("express-rate-limit");

const router = express.Router();

// Rate limiting for login endpoint
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: "Too many login attempts, please try again after 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation middleware
const registerValidation = [
  body("firstName").trim().notEmpty().withMessage("First name is required"),
  body("lastName").trim().notEmpty().withMessage("Last name is required"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),
  body("phone").trim().notEmpty().withMessage("Phone number is required"),
  body("password")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/)
    .withMessage(
      "Password must be at least 8 characters with uppercase, lowercase, number, and special character",
    ),
  body("vehicleType")
    .isIn(["motorcycle", "scooter", "bicycle", "car", "van"])
    .withMessage("Invalid vehicle type"),
  body("vehicleNumber")
    .trim()
    .notEmpty()
    .withMessage("Vehicle number is required"),
  body("drivingLicense").optional().trim(),
  body("bankAccount")
    .trim()
    .notEmpty()
    .withMessage("Bank account number is required"),
  body("ifscCode").trim().notEmpty().withMessage("IFSC code is required"),
  body("bankName").optional().trim(),
  body("agreeTerms")
  .custom((value) => {
    return value === true;
  })
  .withMessage("You must agree to the Terms and Conditions"),
];

const loginValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

const profileValidation = [
  body("firstName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("First name cannot be empty"),
  body("lastName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Last name cannot be empty"),
  body("phone")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Phone number cannot be empty"),
  body("vehicleType")
    .optional()
    .isIn(["motorcycle", "scooter", "bicycle", "car", "van"])
    .withMessage("Invalid vehicle type"),
  body("vehicleNumber")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Vehicle number cannot be empty"),
  body("drivingLicense").optional().trim(),
  body("bankAccount")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Bank account number cannot be empty"),
  body("ifscCode")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("IFSC code cannot be empty"),
  body("bankName").optional().trim(),
  body("address")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Address cannot be empty"),
  body("emergencyContact")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Emergency contact cannot be empty"),
];

// Public routes
router.post(
  "/register",
  registerValidation,
  deliveryBoyController.registerDeliveryBoy,
);
router.post(
  "/login",
  loginLimiter,
  loginValidation,
  deliveryBoyController.loginDeliveryBoy,
);

// Protected routes
router.use(protectDeliveryBoy);

router.get("/profile", deliveryBoyController.getDeliveryBoyProfile);
router.put(
  "/profile",
  profileValidation,
  deliveryBoyController.updateDeliveryBoyProfile,
);
router.put("/availability", deliveryBoyController.updateAvailability);
router.put("/location", deliveryBoyController.updateLocation);
router.get("/dashboard", deliveryBoyController.getDashboardStats);
router.get("/pending-orders-count", deliveryBoyController.getPendingOrdersCount);
router.get("/earnings", earningsController.getEarnings);
router.get("/earnings/stats", earningsController.getEarningsStats);
router.get("/withdrawals", withdrawalController.getWithdrawalHistory);
router.get("/withdrawals/stats", withdrawalController.getWithdrawalStats);
router.post("/withdrawals", withdrawalController.requestWithdrawal);
router.get("/settings", settingsController.getSettings);
router.put("/settings", settingsController.updateSettings);
router.post("/logout", deliveryBoyController.logoutDeliveryBoy);

module.exports = router;
