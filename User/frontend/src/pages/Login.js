import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import {
  sanitizeInput,
  sanitizeEmail,
  isValidEmail,
  validatePassword,
  validateRequired,
  validateUsername,
} from "../utils/validation";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  const handleChange = (e) => {
    const { name, value } = e.target;
    let sanitizedValue = sanitizeInput(value);

    // Additional validation for specific fields
    if (name === "email") {
      sanitizedValue = sanitizeEmail(value);
    }

    setFormData({
      ...formData,
      [name]: sanitizedValue,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validate required fields
      const emailValidation = validateRequired(formData.email, "Email");
      const passwordValidation = validateRequired(
        formData.password,
        "Password",
      );

      if (!emailValidation.valid) {
        setError(emailValidation.message);
        setLoading(false);
        return;
      }

      // Validate email format for login
      if (!isValidEmail(formData.email)) {
        setError("Please enter a valid email address");
        setLoading(false);
        return;
      }

      if (!passwordValidation.valid) {
        setError(passwordValidation.message);
        setLoading(false);
        return;
      }

      // Password strength validation
      const passwordStrengthValidation = validatePassword(formData.password);
      if (!passwordStrengthValidation.valid) {
        setError(passwordStrengthValidation.message);
        setLoading(false);
        return;
      }

      let result;

      if (isLogin) {
        result = await login({
          email: formData.email,
          password: formData.password,
        });
      } else {
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match");
          setLoading(false);
          return;
        }

        // Validate additional fields for registration
        const usernameValidation = validateUsername(formData.username);
        const firstNameValidation = validateRequired(
          formData.firstName,
          "First Name",
        );
        const lastNameValidation = validateRequired(
          formData.lastName,
          "Last Name",
        );
        const isEmailValid = isValidEmail(formData.email);
        const emailValidation = {
          valid: isEmailValid,
          message: !isEmailValid ? "Please enter a valid email address" : "",
        };

        if (
          !usernameValidation.valid ||
          !firstNameValidation.valid ||
          !lastNameValidation.valid ||
          !emailValidation.valid
        ) {
          setError(
            usernameValidation.message ||
              firstNameValidation.message ||
              lastNameValidation.message ||
              emailValidation.message,
          );
          setLoading(false);
          return;
        }

        // Additional required field checks
        if (!formData.firstName.trim()) {
          setError("First name is required");
          setLoading(false);
          return;
        }

        if (!formData.lastName.trim()) {
          setError("Last name is required");
          setLoading(false);
          return;
        }

        if (!formData.email.trim()) {
          setError("Email is required");
          setLoading(false);
          return;
        }

        const registrationData = {
          username: formData.username || formData.email, // Use username or email as username
          name: `${formData.firstName?.trim()} ${formData.lastName?.trim()}`,
          email: formData.email?.trim(),
          password: formData.password,
          role: "user", // Default role for user registration
          phone: formData.phone?.trim() || "+91 9876543210", // Default phone if empty
        };

        console.log("📤 Sending registration data:", registrationData);

        result = await register(registrationData);
      }

      if (result.success) {
        if (isLogin) {
          setLoginSuccess(true); // Show success message briefly
          // Navigate to appropriate dashboard based on user role
          setTimeout(() => {
            if (result.user?.role === "admin") {
              navigate("/admin/dashboard");
            } else if (result.user?.role === "vendor") {
              navigate("/vendor/dashboard");
            } else {
              navigate("/dashboard");
            }
          }, 1500);
        } else {
          setLoginSuccess(true); // Show success message briefly
          // Navigate to appropriate dashboard based on user role
          setTimeout(() => {
            if (result.user?.role === "admin") {
              navigate("/admin/dashboard");
            } else if (result.user?.role === "vendor") {
              navigate("/vendor/dashboard");
            } else {
              navigate("/dashboard");
            }
          }, 1500);
        }
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error("Login error:", err);
      // Provide helpful error messages based on common issues
      if (err.message?.includes("Network") || err.message?.includes("fetch")) {
        setError(
          "Network error. Please check your internet connection and try again.",
        );
      } else if (
        err.message?.includes("401") ||
        err.message?.includes("Unauthorized")
      ) {
        setError(
          "Invalid email or password. Please check your credentials and try again.",
        );
      } else if (
        err.message?.includes("404") ||
        err.message?.includes("Not Found")
      ) {
        setError("Service unavailable. Please try again later.");
      } else {
        setError(
          "Login failed. Please check your credentials or register for a new account.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" bg-gray-50">
      <Navigation />
      <div className="flex items-center justify-center min-h-screen px-4 pt-20">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-5 sm:p-8">
            {/* Logo */}
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tighter text-gray-900">
                APNA DECORATION
              </h1>
              <p className="text-gray-600 mt-2">
                {isLogin ? "Sign in to your account" : "Create your account"}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm sm:text-base font-medium text-red-800">
                      {error}
                    </p>
                    {/* Helpful suggestions based on error type */}
                    {error.includes("Invalid email or password") && (
                      <div className="mt-2 text-sm text-red-600">
                        <p className="font-medium">💡 Try these:</p>
                        <ul className="mt-1 ml-4 list-disc text-xs">
                          <li>Check your email spelling</li>
                          <li>Verify your password is correct</li>
                          <li>Make sure Caps Lock is off</li>
                        </ul>
                      </div>
                    )}
                    {error.includes("register for a new account") && (
                      <div className="mt-2 text-sm text-red-600">
                        <p className="font-medium">💡 Need an account?</p>
                        <p className="mt-1 text-xs">
                          Click "Sign Up" below to create a new account
                        </p>
                      </div>
                    )}
                    {error.includes("Network error") && (
                      <div className="mt-2 text-sm text-red-600">
                        <p className="font-medium">💡 Connection issues?</p>
                        <ul className="mt-1 ml-4 list-disc text-xs">
                          <li>Check your internet connection</li>
                          <li>Try refreshing the page</li>
                          <li>Contact support if problem persists</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Success Message */}
            {loginSuccess && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6">
                <p className="font-medium">
                  {isLogin
                    ? "Login successful! Redirecting to profile..."
                    : "Registration successful! Redirecting to profile..."}
                </p>
                <p className="text-sm text-green-600 mt-2">
                  You will be automatically redirected in a moment...
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setLoginSuccess(false);
                    setError("");
                    setFormData({
                      username: "",
                      firstName: "",
                      lastName: "",
                      email: "",
                      password: "",
                      confirmPassword: "",
                      phone: "",
                      dateOfBirth: "",
                      gender: "",
                    });
                  }}
                  className="mt-3 text-sm text-green-600 hover:text-green-800 underline"
                >
                  Stay here
                </button>
              </div>
            )}

            {/* Form */}
            {!loginSuccess && (
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Username
                      </label>
                      <div className="relative">
                        <User
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                          size={16}
                        />
                        <input
                          type="text"
                          name="username"
                          required={!isLogin}
                          value={formData.username}
                          onChange={handleChange}
                          className="w-full border rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:border-[#2B3445] focus:ring-1 focus:ring-[#2B3445] text-gray-900"
                          placeholder="Choose a username"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          First Name
                        </label>
                        <div className="relative">
                          <User
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            size={16}
                          />
                          <input
                            type="text"
                            name="firstName"
                            required={!isLogin}
                            value={formData.firstName}
                            onChange={handleChange}
                            className="w-full border rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:border-[#2B3445] focus:ring-1 focus:ring-[#2B3445] text-gray-900"
                            placeholder="First Name"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Last Name
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          required={!isLogin}
                          value={formData.lastName}
                          onChange={handleChange}
                          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-[#2B3445] focus:ring-1 focus:ring-[#2B3445] text-gray-900"
                          placeholder="Last Name"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={16}
                    />
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={() => {
                        if (!isValidEmail(formData.email)) {
                          setError("Invalid email format");
                        }
                      }}
                      className="w-full border rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:border-[#2B3445] focus:ring-1 focus:ring-[#2B3445] text-gray-900"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={16}
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full border rounded-lg pl-10 pr-10 py-2 focus:outline-none focus:border-[#2B3445] focus:ring-1 focus:ring-[#2B3445] text-gray-900"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {!isLogin && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <Lock
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                          size={16}
                        />
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          required={!isLogin}
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className="w-full border rounded-lg pl-10 pr-10 py-2 focus:outline-none focus:border-[#2B3445] focus:ring-1 focus:ring-[#2B3445] text-gray-900"
                          placeholder="Confirm your password"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-[#2B3445] focus:ring-1 focus:ring-[#2B3445] text-gray-900"
                          placeholder="+91 9876543210"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Gender
                        </label>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-[#2B3445] focus:ring-1 focus:ring-[#2B3445] text-gray-900"
                        >
                          <option value="">Select</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#2B3445] text-white py-3 sm:py-3.5 rounded-lg font-medium hover:bg-[#1F2937] transition disabled:opacity-50"
                >
                  {loading
                    ? isLogin
                      ? "Signing in…"
                      : "Creating account…"
                    : isLogin
                      ? "Sign In"
                      : "Create Account"}
                </button>
              </form>
            )}

            {/* Toggle between Login and Register */}
            {!loginSuccess && (
              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  {isLogin
                    ? "Don't have an account?"
                    : "Already have an account?"}
                  <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-[#2B3445] hover:underline font-medium ml-1"
                  >
                    {isLogin ? "Sign Up" : "Sign In"}
                  </button>
                </p>
              </div>
            )}

            {/* Demo Account Info */}
            {isLogin && !loginSuccess && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-blue-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-blue-800">
                      🧪 Test Account Credentials:
                    </p>
                    <div className="mt-2 space-y-1">
                      <div className="bg-white px-3 py-2 rounded border border-blue-200">
                        <p className="text-xs font-mono text-gray-700">
                          📧 Email: user@test.com
                        </p>
                      </div>
                      <div className="bg-white px-3 py-2 rounded border border-blue-200">
                        <p className="text-xs font-mono text-gray-700">
                          🔐 Password: TestUser123
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-blue-600">
                      <p className="font-medium">💡 More test accounts:</p>
                      <ul className="mt-1 ml-4 list-disc">
                        <li>john@example.com / JohnDoe123</li>
                        <li>jane@example.com / JaneSmith123</li>
                        <li>mike@example.com / MikeWilson123</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
