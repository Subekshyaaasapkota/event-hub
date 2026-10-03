import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Loader2, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import useAuth from "../../hooks/useAuth";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
  register,
  handleSubmit,
  formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
  setLoading(true);
  const result = await login(data);
  setLoading(false);

  if (result.success) {
  toast.success("Login successful!");
  navigate("/");
  } else {
  toast.error(result.message || "Invalid email or password");
  }
  };

  return (
  <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
  <div className="w-full max-w-md">
  {/* Logo or Brand Header */}
  <div className="text-center mb-8">
  <div className="flex flex-col items-center mb-8">
  {/* The Icon Square */}
  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 mb-4 text-3xl font-black">
  E
  </div>
  {/* The Brand Name */}
  <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
  EventHub
  </h1>
  </div>
  <p className="text-slate-500 mt-2">
  Sign in to manage your Event journey
  </p>
  </div>

  <div className="bg-white rounded-4xl shadow-xl shadow-slate-200/60 p-8 md:p-10 border border-slate-100">
  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
  {/* EMAIL */}
  <div className="space-y-1.5">
  <label className="text-sm font-semibold text-slate-700 ml-1">
  Email Address
  </label>
  <div className="relative group">
  <Mail
  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors"
  size={20}
  />
  <input
  type="email"
  className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border rounded-2xl outline-none transition-all ${
  errors.email
  ? "border-red-300 focus:ring-4 focus:ring-red-50"
  : "border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
  }`}
  placeholder="name@example.com"
  {...register("email", {
  required: "Please enter your email",
  })}
  />
  </div>
  {errors.email && (
  <p className="text-red-500 text-xs font-medium ml-1">
  {errors.email.message}
  </p>
  )}
  </div>

  {/* PASSWORD */}
  <div className="space-y-1.5">
  <div className="flex justify-between items-center px-1">
  <label className="text-sm font-semibold text-slate-700">
  Password
  </label>
  </div>
  <div className="relative group">
  <Lock
  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors"
  size={20}
  />
  <input
  type={showPassword ? "text" : "password"}
  className={`w-full pl-12 pr-12 py-3.5 bg-slate-50 border rounded-2xl outline-none transition-all ${
  errors.password
  ? "border-red-300 focus:ring-4 focus:ring-red-50"
  : "border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
  }`}
  placeholder="••••••••"
  {...register("password", {
  required: "Password is required",
  minLength: { value: 6, message: "At least 6 characters" },
  })}
  />
  <button
  type="button"
  onClick={() => setShowPassword(!showPassword)}
  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
  >
  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
  </button>
  </div>
  {errors.password && (
  <p className="text-red-500 text-xs font-medium ml-1">
  {errors.password.message}
  </p>
  )}
  <Link
  to="/contact"
  className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
  >
  Forgot your password? Get help
  </Link>
  </div>

  {/* SUBMIT BUTTON */}
  <button
  type="submit"
  disabled={loading}
  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-100 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
  >
  {loading ? (
  <>
  <Loader2 className="animate-spin" size={20} />
  <span>Signing in...</span>
  </>
  ) : (
  <>
  <span>Sign In</span>
  <ArrowRight
  size={18}
  className="group-hover:translate-x-1 transition-transform"
  />
  </>
  )}
  </button>
  </form>

  <div className="mt-8 pt-6 border-t border-slate-100 text-center">
  <p className="text-slate-500 text-sm">
  New to EventHub?{""}
  <Link
  to="/signup"
  className="text-indigo-600 font-bold hover:text-indigo-700"
  >
  Create an account
  </Link>
  </p>
  </div>
  </div>
  </div>
  </div>
  );
};

export default Login;
