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

export const normalizePhone = (phone) => {
  let digits = String(phone || "").replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return digits;
};

export const isValidPhone = (phone) => {
  if (!phone) return false;
  return /^[6-9]\d{9}$/.test(normalizePhone(phone));
};

export const isValidIFSC = (ifsc) => {
  if (!ifsc) return false;
  return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(String(ifsc).trim().toUpperCase());
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

// Delivery-specific validations
export const isValidVehicleNumber = (vehicle) => {
  if (!vehicle) return false;
  return /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$/i.test(
    String(vehicle).trim().toUpperCase(),
  );
};

export const isValidLicense = (license) => {
  if (!license) return false;
  return /^[A-Z]{2}[0-9]{13}$/.test(String(license).trim().toUpperCase());
};

export const isValidBankAccount = (account) => {
  if (!account) return false;
  const digits = String(account).replace(/\D/g, "");
  return digits.length >= 9 && digits.length <= 18;
};

export const validateDeliveryLogin = ({ email, password }) => {
  const errors = {};
  if (!String(email || "").trim()) errors.email = "Email is required";
  else if (!isValidEmail(email)) errors.email = "Enter a valid email address";
  if (!password) errors.password = "Password is required";
  else if (password.length < 6) errors.password = "Password is too short";
  const first = Object.values(errors)[0] || "";
  return { valid: !first, errors, message: first };
};

export const validateDeliveryRegister = (formData) => {
  const errors = {};
  if (!String(formData.firstName || "").trim())
    errors.firstName = "First name is required";
  if (!String(formData.lastName || "").trim())
    errors.lastName = "Last name is required";
  if (!String(formData.email || "").trim()) errors.email = "Email is required";
  else if (!isValidEmail(formData.email))
    errors.email = "Enter a valid email address";
  if (!String(formData.phone || "").trim()) errors.phone = "Phone is required";
  else if (!isValidPhone(formData.phone))
    errors.phone = "Enter a valid 10-digit mobile number (e.g. 9876543210)";
  if (!formData.password) errors.password = "Password is required";
  else {
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.valid) errors.password = passwordValidation.message;
  }
  if (!formData.confirmPassword)
    errors.confirmPassword = "Please confirm your password";
  else if (formData.password !== formData.confirmPassword)
    errors.confirmPassword = "Passwords do not match";
  if (!formData.vehicleType) errors.vehicleType = "Select a vehicle type";
  if (!String(formData.vehicleNumber || "").trim())
    errors.vehicleNumber = "Vehicle number is required";
  else if (!isValidVehicleNumber(formData.vehicleNumber))
    errors.vehicleNumber = "Enter a valid vehicle number (e.g., MH12AB1234)";
  if (!String(formData.bankAccount || "").trim())
    errors.bankAccount = "Bank account number is required";
  else if (!isValidBankAccount(formData.bankAccount))
    errors.bankAccount = "Enter a valid bank account number (9-18 digits)";
  if (!String(formData.ifscCode || "").trim())
    errors.ifscCode = "IFSC code is required";
  else if (!isValidIFSC(formData.ifscCode))
    errors.ifscCode = "Enter a valid IFSC code (e.g. SBIN0001234)";
  if (!String(formData.bankName || "").trim())
    errors.bankName = "Bank name is required";
  if (formData.drivingLicense && !isValidLicense(formData.drivingLicense))
    errors.drivingLicense =
      "Enter a valid driving license number (e.g., MH123456789012)";
  if (!formData.agreeTerms)
    errors.agreeTerms = "You must agree to Terms and Conditions";
  const first = Object.values(errors)[0] || "";
  return { valid: !first, errors, message: first };
};
