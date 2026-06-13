export const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());

export const validateAdminLogin = ({ email, password }) => {
  const errors = {};
  if (!String(email || "").trim()) errors.email = "Email is required";
  else if (!isValidEmail(email)) errors.email = "Enter a valid email address";
  if (!password) errors.password = "Password is required";
  else if (password.length < 6)
    errors.password = "Password must be at least 6 characters";
  const first = Object.values(errors)[0] || "";
  return { valid: !first, errors, message: first };
};

export const validateAdminRegister = (formData) => {
  const errors = {};
  if (!String(formData.username || "").trim())
    errors.username = "Username is required";
  else if (formData.username.trim().length < 3)
    errors.username = "Username must be at least 3 characters";
  if (!String(formData.firstName || "").trim())
    errors.firstName = "First name is required";
  if (!String(formData.lastName || "").trim())
    errors.lastName = "Last name is required";
  if (!String(formData.email || "").trim()) errors.email = "Email is required";
  else if (!isValidEmail(formData.email))
    errors.email = "Enter a valid email address";
  if (!formData.password) errors.password = "Password is required";
  else if (formData.password.length < 6)
    errors.password = "Password must be at least 6 characters";
  const first = Object.values(errors)[0] || "";
  return { valid: !first, errors, message: first };
};
