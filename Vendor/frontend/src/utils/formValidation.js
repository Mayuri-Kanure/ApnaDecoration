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

export const isValidEmail = (email) => {
  const emailStr = sanitizeEmail(email);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);
};

export const sanitizePhone = (phoneInput) => {
  const phone = sanitizeInput(phoneInput);
  return phone.replace(/[^\d+\-\(\)\s]/g, "");
};

export const isValidPhone = (phone) => {
  if (!phone) return false;
  let digits = String(phone).replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return /^[6-9]\d{9}$/.test(digits);
};

export const normalizePhone = (phone) => {
  let digits = String(phone || "").replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return digits;
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

export const validateRequired = (value, fieldName) => {
  if (!value || String(value).trim() === "") {
    return { valid: false, message: fieldName + " is required" };
  }
  return { valid: true, message: "" };
};

// Vendor-specific validations
export const isValidGST = (gst) => {
  if (!gst) return false;
  return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
    String(gst).trim().toUpperCase(),
  );
};

export const isValidIFSC = (ifsc) => {
  if (!ifsc) return false;
  return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(String(ifsc).trim().toUpperCase());
};

export const isValidBusinessName = (name) => {
  if (!name || String(name).trim().length < 2) {
    return {
      valid: false,
      message: "Business name must be at least 2 characters",
    };
  }
  if (String(name).trim().length > 100) {
    return {
      valid: false,
      message: "Business name cannot exceed 100 characters",
    };
  }
  return { valid: true, message: "" };
};

export const validateVendorLogin = ({ email, password }) => {
  const errors = {};
  if (!String(email || "").trim()) errors.email = "Email is required";
  else if (!isValidEmail(email)) errors.email = "Enter a valid email address";
  if (!password) errors.password = "Password is required";
  else if (password.length < 6) errors.password = "Password is too short";
  const first = Object.values(errors)[0] || "";
  return { valid: !first, errors, message: first };
};

export const validateVendorSignupStep = (step, formData) => {
  const errors = {};
  if (step === 0) {
    const businessNameValidation = isValidBusinessName(formData.name);
    if (!businessNameValidation.valid)
      errors.name = businessNameValidation.message;
  }
  if (step === 1) {
    if (!String(formData.email || "").trim())
      errors.email = "Email is required";
    else if (!isValidEmail(formData.email))
      errors.email = "Enter a valid email address";
    if (!formData.password) errors.password = "Password is required";
    else {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.valid)
        errors.password = passwordValidation.message;
    }
    if (!formData.confirmPassword)
      errors.confirmPassword = "Please confirm your password";
    else if (formData.password !== formData.confirmPassword)
      errors.confirmPassword = "Passwords do not match";
    if (formData.phone && !isValidPhone(formData.phone))
      errors.phone = "Enter a valid 10-digit mobile number";
  }
  if (step === 2) {
    if (formData.gst && !isValidGST(formData.gst))
      errors.gst = "Enter a valid GST number (e.g., 22AAAAA0000A1Z5)";
    if (formData.ifsc && !isValidIFSC(formData.ifsc))
      errors.ifsc = "Enter a valid IFSC code (e.g., SBIN0001234)";
  }
  if (step === 3 && !formData.agreeTerms) {
    errors.agreeTerms = "You must agree to Terms and Conditions";
  }
  const first = Object.values(errors)[0] || "";
  return { valid: !first, errors, message: first };
};
