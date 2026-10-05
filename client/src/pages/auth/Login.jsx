import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Loader2, Eye, EyeOff, ArrowRight, ArrowLeft, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import useAuth from "../../hooks/useAuth";

const INPUT_BASE =
  "w-full rounded-2xl border bg-white py-3.5 pl-12 text-sm text-ink placeholder-stone-400 outline-none transition-colors duration-200 focus:ring-4";
const INPUT_OK = "border-stone-300 focus:border-stone-500 focus:ring-stone-100";
const INPUT_BAD = "border-red-400 focus:border-red-500 focus:ring-red-100";
const LABEL = "ml-1 text-sm font-semibold text-stone-700";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  // Held in state rather than toasted, because a failed sign in is the one
  // message on this page that a user absolutely has to be able to read.
  const [serverError, setServerError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    setServerError(null);
    const result = await login(data);
    setLoading(false);

    if (result.success) {
      toast.success("Login successful!");
      navigate("/");
    } else {
      setServerError(result.message || "Invalid email or password");
      document.getElementById("login-server-error")?.focus();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper p-4">
      <div className="w-full max-w-md">
        {/* These routes sit outside MainLayout, so there is no navbar and this
            is the only route off the page. */}
        <Link
          to="/"
          className="press mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-stone-600 transition-colors duration-200 hover:text-ink"
        >
          <ArrowLeft size={15} aria-hidden="true" />
          Back to EventHub
        </Link>

        <div className="mb-8 text-center">
          <img
            src="/eventhub-logo.svg"
            alt=""
            width="64"
            height="64"
            className="mb-4 h-16 w-16"
          />
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
            EventHub
          </h1>
          <p className="mt-2 text-stone-600">Sign in to manage your Event journey</p>
        </div>

        <div className="rounded-4xl border border-hairline bg-white p-8 shadow-[0_20px_45px_-28px_rgba(17,17,20,0.35)] md:p-10">
          {serverError && (
            <div
              id="login-server-error"
              tabIndex={-1}
              role="alert"
              className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 outline-none"
            >
              <p className="flex items-start gap-2 text-sm font-medium text-red-800">
                <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                <span>{serverError}</span>
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            <div className="space-y-1.5">
              {/* htmlFor was missing, so clicking the label did nothing and the
                  field had no accessible name. */}
              <label htmlFor="email" className={LABEL}>
                Email Address
              </label>
              <div className="relative group">
                <Mail
                  aria-hidden="true"
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 transition-colors duration-200 group-focus-within:text-stone-700"
                  size={20}
                />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  aria-invalid={errors.email ? true : undefined}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  className={`${INPUT_BASE} pr-4 ${errors.email ? INPUT_BAD : INPUT_OK}`}
                  placeholder="name@example.com"
                  {...register("email", {
                    required: "Enter your email address.",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "That does not look like an email address.",
                    },
                    // Editing either field retires the previous rejection,
                    // otherwise it sits there contradicting what you just typed.
                    onChange: () => setServerError(null),
                  })}
                />
              </div>
              {errors.email && (
                <p id="email-error" className="ml-1 flex items-start gap-1.5 text-xs font-medium text-red-700">
                  <AlertCircle size={13} className="mt-px shrink-0" aria-hidden="true" />
                  <span>{errors.email.message}</span>
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-1">
                <label htmlFor="password" className={LABEL}>
                  Password
                </label>
              </div>
              <div className="relative group">
                <Lock
                  aria-hidden="true"
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 transition-colors duration-200 group-focus-within:text-stone-700"
                  size={20}
                />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  aria-invalid={errors.password ? true : undefined}
                  aria-describedby={errors.password ? "password-error" : undefined}
                  className={`${INPUT_BASE} pr-12 ${errors.password ? INPUT_BAD : INPUT_OK}`}
                  placeholder="Password"
                  {...register("password", {
                    required: "Enter your password.",
                    // Was 6, while signup requires at least 8. Two different
                    // minimums on the same journey.
                    minLength: { value: 8, message: "Passwords are at least 8 characters." },
                    onChange: () => setServerError(null),
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="press absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-stone-500 hover:bg-stone-100 hover:text-ink"
                >
                  {showPassword ? (
                    <EyeOff size={18} aria-hidden="true" />
                  ) : (
                    <Eye size={18} aria-hidden="true" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p id="password-error" className="ml-1 flex items-start gap-1.5 text-xs font-medium text-red-700">
                  <AlertCircle size={13} className="mt-px shrink-0" aria-hidden="true" />
                  <span>{errors.password.message}</span>
                </p>
              )}
              <Link to="/contact" className="underline-grow text-xs font-semibold text-stone-600">
                Forgot your password? Get help
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="press group flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-ink py-4 font-semibold text-paper transition-colors duration-200 hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} aria-hidden="true" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight
                    size={18}
                    aria-hidden="true"
                    className="transition-transform duration-200 group-hover:translate-x-1"
                  />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 border-t border-hairline pt-6 text-center">
            <p className="text-sm text-stone-600">
              New to EventHub?{" "}
              <Link to="/signup" className="underline-grow font-semibold text-ink">
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
