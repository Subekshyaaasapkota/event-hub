import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import useAuth from "../../hooks/useAuth";
import { NEPAL_DISTRICTS } from "../../utils/districts";

const PASSWORD_REGEX =
/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,12}$/;

const NAME_REGEX = /^[A-Za-z][A-Za-z\s]*$/;

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    district: "",
    college: "N/A",
    address: "N/A",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const { name, email, password, confirmPassword, district } = formData;

    if (!name.trim()) {
      return "Please enter your name.";
    }
    if (!NAME_REGEX.test(name.trim())) {
      return "Name must contain alphabets only.";
    }
    if (!email.trim()) {
      return "Please enter your email.";
    }
    if (!district) {
      return "Please select your district.";
    }
    if (password !== confirmPassword) {
      return "Passwords do not match.";
    }
    if (!PASSWORD_REGEX.test(password)) {
      return "Password must be 8-12 characters and include at least one uppercase letter, one number, and one special character.";
    }

    return null;
  };

  const isFormValid = validate() === null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const problem = validate();
    if (problem) {
      return toast.error(problem);
    }

    setSubmitting(true);
    const result = await signup(formData);
    setSubmitting(false);

    if (result.success) {
      toast.success("Account created. You can log in now.");
      navigate("/login");
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 py-12 px-4">
      <div className="bg-white shadow-2xl rounded-3xl p-8 w-full max-w-lg border border-gray-100">
        <h2 className="text-3xl font-bold text-center mb-2 text-[#0F172A]">
          Create Account
        </h2>
        <p className="text-center text-sm text-gray-500 mb-6">
          Browse events and register in a couple of clicks.
        </p>

        <div className="w-full bg-gray-100 h-1.5 rounded-full mb-8 overflow-hidden">
          <div className="bg-indigo-600 h-full w-full"></div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1 ml-1"
            >
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="Full Name"
            />
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1 ml-1"
            >
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="Email"
            />
          </div>

          <div>
            <label
              htmlFor="district"
              className="block text-sm font-medium text-gray-700 mb-1 ml-1"
            >
              District <span className="text-red-500">*</span>
            </label>
            <select
              id="district"
              name="district"
              value={formData.district}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white"
            >
              <option value="">Select District</option>
              {Object.entries(NEPAL_DISTRICTS).map(([province, districts]) => (
                <optgroup key={province} label={province}>
                  {districts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="college"
              className="block text-sm font-medium text-gray-700 mb-1 ml-1"
            >
              College
            </label>
            <input
              id="college"
              type="text"
              name="college"
              value={formData.college}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="College Name"
            />
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="address"
              className="block text-sm font-medium text-gray-700 mb-1 ml-1"
            >
              Full Address
            </label>
            <input
              id="address"
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="Your Address"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1 ml-1"
            >
              Password <span className="text-red-500">*</span>
            </label>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="Password"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1 ml-1"
            >
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
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

          <div className="md:col-span-2 rounded-xl bg-indigo-50 border border-indigo-100 p-4 text-sm text-indigo-900">
            <p className="font-bold">Want to host events instead?</p>
            <p className="mt-1 text-indigo-800">
              Club organizer access is granted by an admin after verification, so it
              cannot be picked during sign up. Create your student account first, then
              submit a club application from your dashboard and we will review it.
            </p>
          </div>

          <button
            type="submit"
            disabled={!isFormValid || submitting}
            className={`md:col-span-2 w-full py-3.5 rounded-xl font-bold transition-all duration-300 ${
              isFormValid && !submitting
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98]"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {submitting ? "Creating account..." : "Complete Sign Up"}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-8 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-600 font-bold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
