// Input sanitization utilities
export const sanitizeInput = (input) => {
  if (typeof input !== "string") return "";

  return input
    .trim()
    .replace(/<script.*?>.*?<\/script>/gi, "")
    .replace(/javascript:/gi, "")
    .substring(0, 500);
};

export const sanitizeEmail = (emailInput) => {
  if (typeof emailInput !== "string") return "";
  return emailInput.trim().toLowerCase();
};

export const isValidEmail = (emailInput) => {
  const email = sanitizeEmail(emailInput);
  const standardEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return standardEmailRegex.test(email);
};

export const sanitizePhone = (phoneInput) => {
  const phone = sanitizeInput(phoneInput);
  return phone.replace(/[^\d+\-\(\)\s]/g, "");
};

export const isValidPhone = (phone) => {
  if (!phone) return false;
  return /^[6-9]\d{9}$/.test(String(phone).replace(/\D/g, ""));
};

export const validatePassword = (password) => {
  if (!password) {
    return {
      valid: false,
      message: "Password is required",
    };
  }

  const errors = [];

  if (password.length < 8) errors.push("8 characters");
  if (!/[A-Z]/.test(password)) errors.push("1 uppercase letter");
  if (!/[a-z]/.test(password)) errors.push("1 lowercase letter");
  if (!/\d/.test(password)) errors.push("1 number");
  if (!/[^A-Za-z0-9]/.test(password)) errors.push("1 special character");

  return {
    valid: errors.length === 0,
    message:
      errors.length > 0 ? `Password must contain: ${errors.join(", ")}` : "",
  };
};

export const validateUsername = (username) => {
  if (!username || username.length < 3) {
    return {
      valid: false,
      message: "Username must be at least 3 characters long",
    };
  }

  if (username.length > 20) {
    return {
      valid: false,
      message: "Username cannot exceed 20 characters",
    };
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return {
      valid: false,
      message: "Username can only contain letters, numbers, and underscores",
    };
  }

  return { valid: true, message: "" };
};

export const validateRequired = (value, fieldName) => {
  if (!value || String(value).trim() === "") {
    return { valid: false, message: fieldName + " is required" };
  }
  return { valid: true, message: "" };
};
