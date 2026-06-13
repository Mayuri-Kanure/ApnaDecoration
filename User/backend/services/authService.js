const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { User } = require("../models");

// Import constants directly since utils are in Shared Resources
const USER_ROLES = {
  ADMIN: "admin",
  USER: "user",
  VENDOR: "vendor",
  DELIVERY: "delivery",
};

// Standardized error codes
const AUTH_ERROR_CODES = {
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  USER_EXISTS: "USER_EXISTS",
  WEAK_PASSWORD: "WEAK_PASSWORD",
  INVALID_EMAIL: "INVALID_EMAIL",
  ACCOUNT_DEACTIVATED: "ACCOUNT_DEACTIVATED",
  ACCOUNT_BLOCKED: "ACCOUNT_BLOCKED",
  SERVER_ERROR: "SERVER_ERROR",
};

// Custom error class with error codes
class AuthError extends Error {
  constructor(message, code = AUTH_ERROR_CODES.SERVER_ERROR) {
    super(message);
    this.code = code;
    this.name = "AuthError";
  }
}

const PRODUCT_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  OUT_OF_STOCK: "out_of_stock",
};

const JWT_CONFIG = {
  SECRET: process.env.JWT_SECRET,
  EXPIRE: process.env.JWT_EXPIRE || "7d",
  REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  REFRESH_EXPIRE: process.env.JWT_REFRESH_EXPIRE || "30d",
};

if (!JWT_CONFIG.SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}
if (!JWT_CONFIG.REFRESH_SECRET) {
  throw new Error("JWT_REFRESH_SECRET environment variable is required");
}

class AuthService {
  // Generate JWT token
  static generateToken(userId, role = "user") {
    return jwt.sign({ userId, role }, JWT_CONFIG.SECRET, {
      expiresIn: JWT_CONFIG.EXPIRE,
    });
  }

  // Generate refresh token
  static generateRefreshToken(userId) {
    return jwt.sign({ userId }, JWT_CONFIG.REFRESH_SECRET, {
      expiresIn: "30d",
    });
  }

  // Verify JWT token
  static verifyToken(token) {
    try {
      return jwt.verify(token, JWT_CONFIG.SECRET);
    } catch (error) {
      throw new Error("Invalid token");
    }
  }

  // Hash password
  static async hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  // Compare password
  static async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  // Register new user
  static async register(userData) {
    const { name, email, password, phone, role } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      throw new AuthError(
        existingUser.email === email
          ? "User already exists with this email"
          : "User already exists with this phone number",
        AUTH_ERROR_CODES.USER_EXISTS,
      );
    }

    // Hash password
    const salt = bcrypt.genSaltSync(12);
    const hashedPassword = bcrypt.hashSync(password, salt);

    // Split name into firstName and lastName
    const nameParts = (name || "").trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    // Create new user
    const user = new User({
      username: email.split("@")[0], // Use email prefix as username
      name,
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      role: role || USER_ROLES.USER,
    });

    await user.save();

    // Generate tokens
    const token = this.generateToken(user._id, user.role);
    const refreshToken = this.generateRefreshToken(user._id);

    return {
      user: {
        id: user._id,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        profileImage: user.profileImage,
      },
      token,
      refreshToken,
    };
  }

  // Login user
  static async login(email, password) {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      throw new AuthError(
        "Invalid email or password",
        AUTH_ERROR_CODES.INVALID_CREDENTIALS,
      );
    }

    // Check if account is deactivated
    if (user.isActive === false) {
      throw new AuthError(
        "Your account has been temporarily disabled. Contact support.",
        AUTH_ERROR_CODES.ACCOUNT_DEACTIVATED,
      );
    }

    // Check if account is blocked
    if (user.isBlocked === true) {
      throw new AuthError(
        "Your account has been blocked. Contact support.",
        AUTH_ERROR_CODES.ACCOUNT_BLOCKED,
      );
    }

    // Check password
    const isPasswordValid = await this.comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new AuthError(
        "Invalid email or password",
        AUTH_ERROR_CODES.INVALID_CREDENTIALS,
      );
    }

    // Generate tokens
    const token = this.generateToken(user._id, user.role);
    const refreshToken = this.generateRefreshToken(user._id);

    return {
      user: {
        id: user._id,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        profileImage: user.profileImage,
      },
      token,
      refreshToken,
    };
  }

  // Validate user input
  static validateUserData(userData) {
    const { name, email, password, phone } = userData;
    const errors = [];

    if (!name || name.trim().length < 2) {
      errors.push("Name is required and must be at least 2 characters");
    }

    if (!email) {
      errors.push("Email is required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push("Please enter a valid email address");
    }

    if (!password) {
      errors.push("Password is required");
    } else {
      const passwordErrors = [];
      if (password.length < 8) {
        passwordErrors.push("8 characters");
      }
      if (!/[A-Z]/.test(password)) {
        passwordErrors.push("1 uppercase letter");
      }
      if (!/[a-z]/.test(password)) {
        passwordErrors.push("1 lowercase letter");
      }
      if (!/\d/.test(password)) {
        passwordErrors.push("1 number");
      }
      if (!/[@$!%*?&]/.test(password)) {
        passwordErrors.push("1 special character");
      }

      if (passwordErrors.length > 0) {
        errors.push(`Password must contain: ${passwordErrors.join(", ")}`);
      }
    }

    if (!phone || !/^[+]?[\d\s-()]{10,}$/.test(phone)) {
      errors.push("Valid phone number is required");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

module.exports = { AuthService, AUTH_ERROR_CODES, AuthError };
