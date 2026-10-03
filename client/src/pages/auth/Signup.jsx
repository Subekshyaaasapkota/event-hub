import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import useAuth from "../../hooks/useAuth";
import { NEPAL_DISTRICTS } from "../../utils/districts";

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  district: "",
  college: "N/A",
  address: "N/A",
  roles: "",
  });

  const handleChange = (e) => {
  setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleChoice = (role) => {
  setFormData({ ...formData, roles: role });
  };

  //  FIXED: This function only checks values, it NEVER calls setError

  const PASSWORD_REGEX =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,12}$/;

const NAME_REGEX = /^[A-Za-z][A-Za-z\s]*$/;

  const isStep1Valid = () => {
  const { name, email, password, confirmPassword, district } = formData;

  return (
  name.trim() !== "" &&
  NAME_REGEX.test(name.trim()) &&
  email.trim() !== "" &&
  PASSWORD_REGEX.test(password) &&
  confirmPassword === password &&
  district !== ""
  );
  };

  // const isStep1Valid = () => {
  //  const { name, email, password, confirmPassword, district } = formData;
  //  return (
  //  name.trim() !== "" &&
  //  email.trim() !== "" &&
  //  password.length >= 6 &&
  //  confirmPassword === password &&
  //  district !== ""
  //  );
  // };

  const handleNext = () => {
  const { name, email, password, confirmPassword, district } = formData;

  // Name validation
  const nameRegex = /^[A-Za-z][A-Za-z\s]*$/;

  if (!name.trim()) {
  return toast.error("Please enter your name.");
  }

  if (!nameRegex.test(name.trim())) {
  return toast.error("Name must contain alphabets only.");
  }

  if (!email.trim() || !district || !password) {
  return toast.error("Please fill in all required fields.");
  }

  if (password !== confirmPassword) {
  return toast.error("Passwords do not match!");
  }

  if (!PASSWORD_REGEX.test(password)) {
  return toast.error(
  "Password must be 8-12 characters and contain at least one uppercase letter, one number, and one special character.",
  );
  }

  // if (password.length < 6) {
  //  return toast.error("Password must be at least 6 characters.");
  // }

  setStep(2);
  };

  // const handleNext = () => {
  //  const { name, email, password, confirmPassword, district } = formData;

  //  //  VALIDATION LOGIC ON CLICK
  //  if (!name || !email || !district || !password) {
  //  return toast.error("Please fill in all required fields.");
  //  }
  //  if (password !== confirmPassword) {
  //  return toast.error("Passwords do not match!");
  //  }
  //  if (password.length < 6) {
  //  return toast.error("Password must be at least 6 characters.");
  //  }

  //  setStep(2);
  // };

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!formData.roles) return toast.error("Please select a role.");

  const result = await signup(formData);
  if (result.success) {
  toast.success("Account created successfully!");
  navigate("/login");
  } else {
  toast.error(result.message);
  }
  };

  return (
  <div className="flex items-center justify-center min-h-screen bg-gray-50 py-12 px-4">
  <div className="bg-white shadow-2xl rounded-3xl p-8 w-full max-w-lg border border-gray-100">
  {step === 1 ? (
  <>
  <h2 className="text-3xl font-bold text-center mb-2 text-[#0F172A]">
  Create Account
  </h2>
  <div className="w-full bg-gray-100 h-1.5 rounded-full mb-8 overflow-hidden">
  <div
  className="bg-indigo-600 h-full transition-all duration-500"
  style={{ width: "50%" }}
  ></div>
  </div>

  <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div className="md:col-span-2">
  <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">
  Full Name <span className="text-red-500">*</span>
  </label>
  <input
  type="text"
  name="name"
  value={formData.name}
  onChange={handleChange}
  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
  placeholder="Full Name (Account Creator)"
  />
  </div>

  <div className="md:col-span-2">
  <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">
  Email <span className="text-red-500">*</span>
  </label>
  <input
  type="email"
  name="email"
  value={formData.email}
  onChange={handleChange}
  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
  placeholder="Email"
  />
  </div>

  <div>
  <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">
  District <span className="text-red-500">*</span>
  </label>
  <select
  name="district"
  value={formData.district}
  onChange={handleChange}
  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white"
  >
  <option value="">Select District</option>
  {Object.entries(NEPAL_DISTRICTS).map(
  ([province, districts]) => (
  <optgroup key={province} label={province}>
  {districts.map((d) => (
  <option key={d} value={d}>
  {d}
  </option>
  ))}
  </optgroup>
  ),
  )}
  </select>
  </div>

  <div>
  <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">
  College
  </label>
  <input
  type="text"
  name="college"
  value={formData.college}
  onChange={handleChange}
  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
  placeholder="College Name"
  />
  </div>

  <div className="md:col-span-2">
  <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">
  Full Address
  </label>
  <input
  type="text"
  name="address"
  value={formData.address}
  onChange={handleChange}
  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
  placeholder="Your Address"
  />
  </div>

  <div>
  <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">
  Password <span className="text-red-500">*</span>
  </label>
  <input
  type={showPassword ? "text" : "password"}
  name="password"
  value={formData.password}
  onChange={handleChange}
  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
  placeholder="Password"
  />
  </div>

  <div>
  <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">
  Confirm Password <span className="text-red-500">*</span>
  </label>
  <input
  type={showPassword ? "text" : "password"}
  name="confirmPassword"
  value={formData.confirmPassword}
  onChange={handleChange}
  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
  placeholder="Confirm Password"
  />
  </div>

  <div className="md:col-span-2 flex items-center mb-2">
  <input
  id="show-password"
  type="checkbox"
  checked={showPassword}
  onChange={() => setShowPassword(!showPassword)}
  className="w-4 h-4 text-indigo-600 border-gray-300 rounded cursor-pointer focus:ring-indigo-500"
  />
  <label
  htmlFor="show-password"
  className="select-none ms-2 text-sm font-medium text-gray-600 cursor-pointer"
  >
  Show Passwords
  </label>
  </div>

  <button
  type="button"
  onClick={handleNext}
  className={`md:col-span-2 w-full py-3.5 rounded-xl font-bold transition-all duration-300 ${
  isStep1Valid()
  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98]"
  : "bg-gray-200 text-gray-400 cursor-not-allowed"
  }`}
  >
  Next: Choose Role
  </button>
  </form>
  </>
  ) : (
  /* STEP 2: ROLE SELECTION */
  <>
  <h2 className="text-3xl font-bold text-center mb-2 text-[#0F172A]">
  Choose Your Role
  </h2>
  <div className="w-full bg-gray-100 h-1.5 rounded-full mb-8 overflow-hidden">
  <div className="bg-indigo-600 h-full w-full"></div>
  </div>

  <div className="grid grid-cols-1 gap-4 mb-8">
  <div
  onClick={() => handleRoleChoice("Student")}
  className={`p-5 border-2 rounded-2xl cursor-pointer transition-all ${
  formData.roles === "Student"
  ? "border-indigo-600 bg-indigo-50 ring-2 ring-indigo-100"
  : "border-gray-100 hover:border-indigo-200"
  }`}
  >
  <h3 className="font-bold text-lg"> Student</h3>
  <p className="text-sm text-gray-500">
  I want to discover and attend events.
  </p>
  </div>

  <div
  onClick={() => handleRoleChoice("Club")}
  className={`p-5 border-2 rounded-2xl cursor-pointer transition-all ${
  formData.roles === "Club"
  ? "border-purple-600 bg-purple-50 ring-2 ring-purple-100"
  : "border-gray-100 hover:border-purple-200"
  }`}
  >
  <h3 className="font-bold text-lg"> Organizer / Club</h3>
  <p className="text-sm text-gray-500">
  I want to host and manage events.
  </p>
  </div>
  </div>

  <div className="flex gap-4">
  <button
  type="button"
  onClick={() => setStep(1)}
  className="w-1/3 py-3.5 border-2 border-gray-100 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-all"
  >
  Back
  </button>
  <button
  type="button"
  onClick={handleSubmit}
  className={`w-2/3 py-3.5 rounded-xl font-bold text-white shadow-lg transition-all ${
  formData.roles
  ? "bg-indigo-600 shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98]"
  : "bg-gray-300 cursor-not-allowed"
  }`}
  >
  Complete Sign Up
  </button>
  </div>
  </>
  )}

  <p className="text-center text-gray-600 mt-8 text-sm">
  Already have an account?{""}
  <Link
  to="/login"
  className="text-indigo-600 font-bold hover:underline"
  >
  Login
  </Link>
  </p>
  </div>
  </div>
  );
};

export default Signup;
