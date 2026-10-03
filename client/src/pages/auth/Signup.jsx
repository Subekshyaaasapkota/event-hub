import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Check, AlertCircle, ArrowLeft } from "lucide-react";
import useAuth from "../../hooks/useAuth";
import { NEPAL_DISTRICTS } from "../../utils/districts";

const PASSWORD_REGEX =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,12}$/;

const NAME_REGEX = /^[A-Za-z][A-Za-z\s]*$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Shown live under the password field. Stating the rules up front is kinder
// than the old behaviour, where a failed submit produced a toast and nothing
// on the field itself.
const PASSWORD_RULES = [
  { id: "length", label: "8 to 12 characters", test: (v) => v.length >= 8 && v.length <= 12 },
  { id: "upper", label: "One uppercase letter", test: (v) => /[A-Z]/.test(v) },
  { id: "digit", label: "One number", test: (v) => /\d/.test(v) },
  { id: "symbol", label: "One special character", test: (v) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(v) },
];

// Returns a field -> message map rather than a single string, so each message
// can live next to the input it belongs to.
const validate = (values) => {
  const errors = {};
  const name = values.name.trim();
  const email = values.email.trim();

  if (!name) errors.name = "Enter your full name.";
  else if (!NAME_REGEX.test(name)) errors.name = "Use letters and spaces only.";

  if (!email) errors.email = "Enter your email address.";
  else if (!EMAIL_REGEX.test(email)) errors.email = "That does not look like an email address.";

  if (!values.district) errors.district = "Select your district.";

  if (!values.password) errors.password = "Choose a password.";
  else if (!PASSWORD_REGEX.test(values.password)) {
    errors.password = "Your password does not meet all four requirements below.";
  }

  if (values.confirmPassword !== values.password) {
    errors.confirmPassword = "The two passwords do not match.";
  }

  return errors;
};

const FIELD_ORDER = ["name", "email", "district", "password", "confirmPassword"];

const INPUT_BASE =
  "w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-ink placeholder-stone-400 outline-none transition-colors duration-200 focus:ring-2";
const INPUT_OK = "border-stone-300 focus:border-stone-500 focus:ring-stone-300";
const INPUT_BAD = "border-red-400 focus:border-red-500 focus:ring-red-200";

const LABEL = "mb-1.5 ml-1 block text-sm font-medium text-stone-700";

const FieldError = ({ id, message }) =>
  message ? (
    <p id={id} className="mt-1.5 ml-1 flex items-start gap-1.5 text-xs font-medium text-red-700">
      <AlertCircle size={14} className="mt-px shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </p>
  ) : null;

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // Errors stay hidden until the first submit attempt. Shouting at someone
  // while they are still typing their email address is not helpful.
  const [showErrors, setShowErrors] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    district: "",
    college: "N/A",
    address: "N/A",
  });

  const errors = validate(formData);
  const errorList = FIELD_ORDER.filter((f) => errors[f]);
  const errorCount = errorList.length;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // A server error refers to the whole submission, so any edit clears it.
    setServerError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowErrors(true);
    setServerError(null);

    const found = validate(formData);
    if (Object.keys(found).length > 0) {
      // Send focus to the first problem rather than leaving the user hunting
      // for which of seven fields went wrong.
      const first = FIELD_ORDER.find((f) => found[f]);
      document.getElementById(first)?.focus();
      return;
    }

    setSubmitting(true);
    const result = await signup(formData);
    setSubmitting(false);

    if (result.success) {
      toast.success("Account created. You can log in now.");
      navigate("/login");
    } else {
      setServerError(result.message);
      // Nothing above the form has focus, so announce it for screen readers.
      document.getElementById("signup-server-error")?.focus();
    }
  };

  const fieldProps = (field) => ({
    id: field,
    name: field,
    value: formData[field],
    onChange: handleChange,
    "aria-required": "true",
    "aria-invalid": showErrors && errors[field] ? true : undefined,
    "aria-describedby":
      showErrors && errors[field] ? `${field}-error` : field === "password" ? "password-rules" : undefined,
    className: `${INPUT_BASE} ${showErrors && errors[field] ? INPUT_BAD : INPUT_OK}`,
  });


  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-4 py-12">
      <div className="w-full max-w-lg">
        {/* These two routes sit outside MainLayout, so there is no navbar here
            and this is the only way back to the site. */}
        <Link
          to="/"
          className="press mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-stone-600 transition-colors duration-200 hover:text-ink"
        >
          <ArrowLeft size={15} aria-hidden="true" />
          Back to EventHub
        </Link>

        <div className="reveal rounded-3xl border border-hairline bg-white p-8 shadow-[0_20px_45px_-28px_rgba(17,17,20,0.35)]">
          <h1 className="mb-2 font-display text-2xl font-semibold text-ink">
            Create Account
          </h1>
          <p className="mb-7 text-sm text-stone-600">
            Browse events and register in a couple of clicks.
          </p>

          {/* The old progress bar sat permanently at 100%. It implied a
              multi-step flow that does not exist. Removed rather than faked. */}

          {/* Announces the problem count once validation has run, without
              stealing focus from the field the user is being sent to. */}
          <p aria-live="polite" className="sr-only">
            {showErrors && errorCount > 0
              ? `${errorCount} ${errorCount === 1 ? "field needs" : "fields need"} your attention.`
              : ""}
          </p>

          {serverError && (
            <div
              id="signup-server-error"
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

          <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label htmlFor="name" className={LABEL}>
                Full Name
              </label>
              <input
                {...fieldProps("name")}
                type="text"
                autoComplete="name"
                placeholder="Full Name"
              />
              <FieldError id="name-error" message={showErrors ? errors.name : null} />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="email" className={LABEL}>
                Email
              </label>
              <input
                {...fieldProps("email")}
                type="email"
                autoComplete="email"
                placeholder="Email"
              />
              <FieldError id="email-error" message={showErrors ? errors.email : null} />
            </div>

            <div>
              <label htmlFor="district" className={LABEL}>
                District
              </label>
              <select {...fieldProps("district")} className={`${INPUT_BASE} ${INPUT_OK}`}>
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
              <FieldError id="district-error" message={showErrors ? errors.district : null} />
            </div>

            <div>
              <label htmlFor="college" className={LABEL}>
                College <span className="font-normal text-stone-500">(optional)</span>
              </label>
              <input
                id="college"
                name="college"
                type="text"
                autoComplete="organization"
                value={formData.college}
                onChange={handleChange}
                className={`${INPUT_BASE} ${INPUT_OK}`}
                placeholder="College Name"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="address" className={LABEL}>
                Address <span className="font-normal text-stone-500">(optional)</span>
              </label>
              <input
                id="address"
                name="address"
                type="text"
                autoComplete="street-address"
                value={formData.address}
                onChange={handleChange}
                className={`${INPUT_BASE} ${INPUT_OK}`}
                placeholder="Your Address"
              />
            </div>

            <div>
              <label htmlFor="password" className={LABEL}>
                Password
              </label>
              <input
                {...fieldProps("password")}
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Password"
              />
              <FieldError id="password-error" message={showErrors ? errors.password : null} />
            </div>

            <div>
              <label htmlFor="confirmPassword" className={LABEL}>
                Confirm Password
              </label>
              <input
                {...fieldProps("confirmPassword")}
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Confirm Password"
              />
              <FieldError id="confirmPassword-error" message={showErrors ? errors.confirmPassword : null} />
            </div>

            <div id="password-rules" className="md:col-span-2 -mt-1">
              <ul className="grid gap-1.5 sm:grid-cols-2">
                {PASSWORD_RULES.map((rule) => {
                  const met = rule.test(formData.password);
                  return (
                    <li
                      key={rule.id}
                      className={`flex items-center gap-2 text-xs transition-colors duration-200 ${
                        met ? "font-medium text-emerald-800" : "text-stone-600"
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full transition-colors duration-200 ${
                          met ? "bg-emerald-600 text-white" : "border border-stone-300"
                        }`}
                      >
                        {met && <Check size={11} strokeWidth={3} />}
                      </span>
                      {rule.label}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="md:col-span-2 flex items-center">
              <input
                id="show-password"
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword((v) => !v)}
                className="h-4 w-4 shrink-0 cursor-pointer rounded border-stone-300 accent-stone-800 focus:ring-stone-400"
              />
              <label
                htmlFor="show-password"
                className="ms-2 cursor-pointer select-none text-sm font-medium text-stone-700"
              >
                Show Passwords
              </label>
            </div>

            <div className="md:col-span-2 rounded-xl border border-hairline bg-stone-50 p-4 text-sm">
              <p className="font-semibold text-ink">Want to host events instead?</p>
              <p className="mt-1 leading-relaxed text-stone-600">
                Club organizer access is granted by an admin after verification, so it
                cannot be picked during sign up. Create your student account first, then
                submit a club application from your dashboard and we will review it.
              </p>
            </div>

            {/* Deliberately not disabled when invalid. The old button stayed grey
                with no explanation of why, which left people filling the form in
                and then unable to work out what to do. Now it is always clickable
                and reveals exactly which fields are the problem. */}
            <button
              type="submit"
              disabled={submitting}
              className="press md:col-span-2 w-full rounded-xl bg-ink py-3.5 text-sm font-semibold text-paper hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Creating account..." : "Complete Sign Up"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-stone-600">
            Already have an account?{" "}
            <Link to="/login" className="underline-grow font-semibold text-ink">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
