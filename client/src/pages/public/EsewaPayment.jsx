import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../api/axios";

const EsewaPayment = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState(null);

  useEffect(() => {
  const preparePayment = async () => {
  try {
  const requestId = searchParams.get("request_id");

  if (!requestId) {
  setError("Missing payment reference");
  setLoading(false);
  return;
  }

  if (!localStorage.getItem("authToken")) {
  setError("Session expired. Please log in again.");
  setLoading(false);
  return;
  }

  // The server derives the amount from the database, so only the
  // registration id is sent here.
  const response = await api.get(
  `/api/payments/esewa/form?request_id=${encodeURIComponent(requestId)}`,
  );

  if (response.data.success) {
  setFormData(response.data.data);
  setLoading(false);

  // Auto-submit the form after a short delay
  setTimeout(() => {
  const form = document.getElementById("esewaForm");
  if (form) {
  form.submit();
  }
  }, 500);
  } else {
  setError(response.data.message || "Failed to prepare payment");
  setLoading(false);
  }
  } catch (err) {
  console.error("Full error response:", err.response?.data);
  // console.error("Error preparing eSewa payment:", err);
  setError(
  err.response?.data?.message ||
  err.message ||
  "Payment preparation failed",
  );
  setLoading(false);
  }
  };

  preparePayment();
  }, [searchParams]);

  return (
  <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
  <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden p-8">
  {loading && (
  <div className="text-center space-y-4">
  <div className="flex justify-center">
  <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600"></div>
  </div>
  <h2 className="text-2xl font-black text-slate-800">
  Preparing eSewa Payment...
  </h2>
  <p className="text-slate-600">
  You will be redirected to eSewa in a moment.
  </p>
  </div>
  )}

  {error && (
  <div className="text-center space-y-4">
  <div className="text-6xl"></div>
  <h2 className="text-2xl font-black text-slate-800">
  Payment Error
  </h2>
  <p className="text-slate-600">{error}</p>
  <button
  onClick={() => (window.location.href = "/")}
  className="press w-full rounded-xl bg-ink px-5 py-3 font-semibold text-paper transition-colors duration-150 hover:bg-ink-soft active:scale-[0.98]"
  >
  Return Home
  </button>
  </div>
  )}

  {/* Hidden eSewa Payment Form */}
  {formData && (
  <form
  id="esewaForm"
  method="POST"
  action={
  formData.action ||
  "https://rc-epay.esewa.com.np/api/epay/main/v2/form"
  }
  >
  {Object.entries(formData).map(([key, value]) => (
  <input key={key} type="hidden" name={key} value={value} />
))}
  </form>
  )}
  </div>
  </div>
  );
};

export default EsewaPayment;
