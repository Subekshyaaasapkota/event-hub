import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../../api/axios";
import { CheckCircle, AlertCircle } from "lucide-react";

const PaymentSuccess = () => {
  const [paymentStatus, setPaymentStatus] = useState("processing");
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
  const verifyPayment = async () => {
  try {
  const queryParams = new URLSearchParams(location.search);

  const pidx = queryParams.get("pidx");
  const transactionCode = queryParams.get("transaction_code");

  console.log("Payment callback received:", {
  pidx,
  transactionCode,
  allParams: Object.fromEntries(queryParams.entries()),
  });

  const token = localStorage.getItem("authToken");
  if (!token) {
  setError("Session expired. Please log in again.");
  setPaymentStatus("failed");
  return;
  }

  if (pidx) {
  //  Khalti verification 
  console.log(" Verifying Khalti payment with pidx:", pidx);
  const response = await api.post("/api/payments/khalti/verify", {
  pidx,
  });

  console.log(" Backend verification response:", response.data);

  // The backend returns { success: true, data: { status: "Completed", ... } }
  const khaltiData = response.data.data || response.data;

  if (khaltiData && khaltiData.status === "Completed") {
  setPaymentStatus("success");
  setPaymentDetails({
  gateway: "Khalti",
  amount: (khaltiData.total_amount || khaltiData.amount) / 100, 
  transactionId: khaltiData.transaction_id,
  pidx,
  status: khaltiData.status,
  });
  toast.success("Payment verified successfully!");
  } else {
  console.warn(" Khalti payment not completed:", khaltiData);
  setPaymentStatus("failed");
  setError(`Payment status: ${khaltiData?.status || "Unknown"}`);
  toast.error(`Payment ${khaltiData?.status?.toLowerCase() || "failed"}`);
  }
  } else {
  //  eSewa verification 
  // eSewa v2 redirects with a base64-encoded JSON `data` param.
  // eSewa v1 (or manual) redirects with individual query params.
  let esewaRequestId = queryParams.get("request_id");
  let esewaTransactionCode = transactionCode;
  let esewaAmount = queryParams.get("amount");
  let esewaStatus = null;

  const esewaDataParam = queryParams.get("data");
  if (esewaDataParam) {
  try {
  const decoded = JSON.parse(atob(esewaDataParam));
  console.log(" eSewa v2 callback decoded:", decoded);
  esewaRequestId =
  decoded.transaction_uuid || decoded.request_id || esewaRequestId;
  esewaTransactionCode =
  decoded.transaction_code || decoded.ref_id || esewaTransactionCode;
  esewaAmount =
  decoded.total_amount || decoded.amount || esewaAmount;
  esewaStatus = decoded.status; // e.g. "COMPLETE"
  } catch (decodeErr) {
  console.warn("Could not decode eSewa `data` param:", decodeErr);
  }
  }

  if (!esewaRequestId) {
  setPaymentStatus("pending");
  setError(
  "Unable to determine payment status. Please contact support.",
  );
  return;
  }

  console.log(
  " Verifying eSewa payment with request_id:",
  esewaRequestId,
  );
  const response = await api.post("/api/payments/esewa/verify", {
  request_id: esewaRequestId,
  amount: esewaAmount,
  transaction_code: esewaTransactionCode,
  });

  console.log(" eSewa verification response:", response.data);

  const isSuccess =
  response.data.data?.status === "SUCCESS" ||
  response.data.data?.response_code === 0 ||
  esewaStatus === "COMPLETE";

  if (isSuccess) {
  setPaymentStatus("success");
  setPaymentDetails({
  gateway: "eSewa",
  amount:
  response.data.data?.amount || esewaAmount,
  transactionId: esewaTransactionCode,
  requestId: esewaRequestId,
  status: response.data.data?.status || "SUCCESS",
  referenceCode: response.data.data?.reference_code,
  });
  toast.success("Payment verified successfully!");
  } else {
  setPaymentStatus("failed");
  setError(
  `Payment status: ${response.data.data?.status || esewaStatus || "FAILED"}`,
  );
  toast.error(
  `Payment ${response.data.data?.status || esewaStatus || "FAILED"}`,
  );
  }
  }
  } catch (err) {
  console.error(" Payment verification error:", err);
  setPaymentStatus("failed");
  setError(
  err.response?.data?.message ||
  err.message ||
  "Payment verification failed",
  );
  toast.error("Payment verification failed");
  }
  };

  verifyPayment();
  }, [location.search]);

  return (
  <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
  <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
  {/* Success State */}
  {paymentStatus === "success" && (
  <div className="p-8 text-center space-y-6">
  <div className="w-20 h-20 mx-auto bg-linear-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
  <CheckCircle size={40} className="text-white" />
  </div>

  <div>
  <h1 className="text-3xl font-black text-slate-800 mb-2">
  Payment Successful! 
  </h1>
  <p className="text-slate-600 font-medium">
  Your registration has been confirmed.
  </p>
  </div>

  {paymentDetails && (
  <div className="bg-slate-50 p-6 rounded-2xl space-y-3 text-left border border-slate-100">
  <div className="flex justify-between items-center">
  <span className="text-slate-500 font-medium text-sm">
  Gateway:
  </span>
  <span className="font-bold text-slate-800">
  {paymentDetails.gateway}
  </span>
  </div>
  <div className="border-t border-slate-200"></div>
  <div className="flex justify-between items-center">
  <span className="text-slate-500 font-medium text-sm">
  Amount:
  </span>
  <span className="font-bold text-slate-800">
  Rs. {paymentDetails.amount}
  </span>
  </div>
  <div className="border-t border-slate-200"></div>
  <div className="flex justify-between items-center">
  <span className="text-slate-500 font-medium text-sm">
  Transaction ID:
  </span>
  <span className="font-mono text-xs bg-white p-2 rounded border border-slate-100 text-slate-600 max-w-xs truncate">
  {paymentDetails.transactionId ||
  paymentDetails.pidx ||
  paymentDetails.requestId}
  </span>
  </div>
  {paymentDetails.referenceCode && (
  <>
  <div className="border-t border-slate-200"></div>
  <div className="flex justify-between items-center">
  <span className="text-slate-500 font-medium text-sm">
  Ref Code:
  </span>
  <span className="font-mono text-xs bg-white p-2 rounded border border-slate-100 text-slate-600">
  {paymentDetails.referenceCode}
  </span>
  </div>
  </>
  )}
  </div>
  )}

  <button
  onClick={() => navigate("/dashboard")}
  className="w-full bg-linear-to-r from-green-500 to-emerald-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:shadow-lg transition-all active:scale-95"
  >
  Go to Dashboard
  </button>

  <button
  onClick={() => navigate("/")}
  className="w-full bg-slate-100 text-slate-700 py-3 rounded-2xl font-bold uppercase tracking-wider text-sm hover:bg-slate-200 transition-all"
  >
  Return Home
  </button>
  </div>
  )}

  {/* Processing State */}
  {paymentStatus === "processing" && (
  <div className="p-8 text-center space-y-6">
  <div className="flex justify-center">
  <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
  </div>
  <div>
  <h1 className="text-2xl font-black text-slate-800 mb-2">
  Verifying Payment...
  </h1>
  <p className="text-slate-600 font-medium">
  Please wait while we confirm your payment.
  </p>
  </div>
  </div>
  )}

  {/* Failed State */}
  {paymentStatus === "failed" && (
  <div className="p-8 text-center space-y-6">
  <div className="w-20 h-20 mx-auto bg-linear-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-lg">
  <AlertCircle size={40} className="text-white" />
  </div>

  <div>
  <h1 className="text-3xl font-black text-slate-800 mb-2">
  Payment Failed 
  </h1>
  <p className="text-slate-600 font-medium">
  {error || "Your payment could not be processed."}
  </p>
  </div>

  <div className="bg-red-50 border border-red-200 p-4 rounded-2xl">
  <p className="text-red-700 font-medium text-sm">
  Please try registering again with a different payment method or
  contact support if the problem persists.
  </p>
  </div>

  <div className="space-y-3">
  <button
  onClick={() => navigate(-1)}
  className="w-full bg-linear-to-r from-red-500 to-rose-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:shadow-lg transition-all active:scale-95"
  >
  Try Again
  </button>
  <button
  onClick={() => navigate("/")}
  className="w-full bg-slate-100 text-slate-700 py-3 rounded-2xl font-bold uppercase tracking-wider text-sm hover:bg-slate-200 transition-all"
  >
  Return Home
  </button>
  </div>
  </div>
  )}

  {/* Pending State */}
  {paymentStatus === "pending" && (
  <div className="p-8 text-center space-y-6">
  <div className="w-20 h-20 mx-auto bg-linear-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
  <AlertCircle size={40} className="text-white" />
  </div>

  <div>
  <h1 className="text-2xl font-black text-slate-800 mb-2">
  Payment Pending 
  </h1>
  <p className="text-slate-600 font-medium">
  {error ||
  "We are unable to verify your payment at this moment."}
  </p>
  </div>

  <button
  onClick={() => navigate("/dashboard")}
  className="w-full bg-linear-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:shadow-lg transition-all active:scale-95"
  >
  Go to Dashboard
  </button>
  </div>
  )}
  </div>
  </div>
  );
};

export default PaymentSuccess;
