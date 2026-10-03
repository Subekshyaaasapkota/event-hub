import useAuth from "../../hooks/useAuth";
import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { CheckCircle, ChevronRight, ChevronLeft, AlertCircle } from "lucide-react";
import useEvents from "../../hooks/useEvents";
import usePayment from "../../hooks/usePayment";

// Payment Full Assets
import khaltiFull from "../../assets/payment/khalti-full logo.jpg";
import esewaFull from "../../assets/payment/esewa-full logo.jpg";

//  Constants 

const STEPS = [
  { id: 1, label: "Personal" },
  { id: 2, label: "Academic" },
  { id: 3, label: "Confirm" },
];

const PAYMENT_GATEWAYS = [
  {
  id: "khalti",
  name: "Khalti",
  tagline: "Digital Wallet",
  color: "#5C2D91",
  bg: "#F5F0FB",
  border: "#C4A8E8",
  initial: "K",
  },
  {
  id: "esewa",
  name: "eSewa",
  tagline: "Digital Wallet",
  color: "#1B7B3A",
  bg: "#F0F9F4",
  border: "#7BC99A",
  initial: "E",
  },
];

//  Sub-components 

const FieldLabel = ({ children }) => (
  <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 mb-1.5 pl-0.5">
  {children}
  </label>
);

const Input = ({ ...props }) => (
  <input
  {...props}
  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl
  focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100
  outline-none transition-all text-slate-700 font-medium placeholder-slate-300 text-sm"
  />
);

const Textarea = ({ ...props }) => (
  <textarea
  {...props}
  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl
  focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100
  outline-none transition-all text-slate-700 font-medium placeholder-slate-300
  resize-none text-sm"
  />
);

const SummaryRow = ({ label, value }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</span>
  <span className="text-sm text-slate-700 font-medium">
  {value || <span className="text-slate-300 italic text-xs">Not provided</span>}
  </span>
  </div>
);

//  Step Indicators 

const StepBar = ({ currentStep }) => (
  <div className="flex items-center justify-between mb-10 px-1 relative">
  {/* Track */}
  <div className="absolute top-5 left-0 w-full h-px bg-slate-100 z-0" />
  {/* Progress */}
  <div
  className="absolute top-5 left-0 h-px bg-indigo-400 z-0 transition-all duration-500"
  style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
  />
  {STEPS.map((s) => {
  const done = currentStep > s.id;
  const active = currentStep === s.id;
  return (
  <div key={s.id} className="relative z-10 flex flex-col items-center">
  <div
  className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
  ${done ? "bg-indigo-500 text-white shadow-md shadow-indigo-200" : ""}
  ${active ? "bg-white border-2 border-indigo-400 text-indigo-500 shadow-md shadow-indigo-100" : ""}
  ${!done && !active ? "bg-white border border-slate-200 text-slate-300" : ""}
  `}
  >
  {done ? <CheckCircle size={16} /> : s.id}
  </div>
  <span
  className={`text-[9px] uppercase tracking-widest font-bold mt-2 transition-colors duration-300
  ${currentStep >= s.id ? "text-indigo-500" : "text-slate-300"}`}
  >
  {s.label}
  </span>
  </div>
  );
  })}
  </div>
);

//  Payment Gateway Selector 

const GatewayOption = ({ gateway, selected, onSelect }) => (
  <button
  type="button"
  onClick={() => onSelect(gateway.id)}
  style={
  selected
  ? { borderColor: gateway.border, backgroundColor: gateway.bg }
  : {}
  }
  className={`relative group p-5 rounded-2xl border-2 transition-all duration-300 text-center w-full overflow-hidden
  ${selected ? "shadow-xl shadow-indigo-100/50" : "border-slate-100 bg-white hover:border-slate-200 hover:shadow-lg"}
  `}
  >
  <div className="flex flex-col items-center justify-center gap-3">
  <div
  className={`w-full h-16 flex items-center justify-center p-1 transition-transform duration-500`}
  >
  {gateway.id === "khalti" ? (
  <img src={khaltiFull} alt="Khalti" className="max-w-full max-h-full object-contain" />
  ) : (
  <img src={esewaFull} alt="eSewa" className="max-w-full max-h-full object-contain" />
  )}
  </div>

  {selected && (
  <div 
  className="absolute top-3 right-3 w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-lg animate-in zoom-in duration-300"
  style={{ color: gateway.color }}
  >
  <CheckCircle size={12} />
  </div>
  )}
  </div>
  </button>
);

//  Main Component 

const RegistrationForm = ({ eventId, onClose, onSuccess }) => {
  const { user } = useAuth();
  const { registerForEvent, fetchEventById } = useEvents();
  const { initiateKhalti } = usePayment();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [eventData, setEventData] = useState(null);
  const [selectedGateway, setSelectedGateway] = useState("");

  const [formData, setFormData] = useState({
  name: user?.name || "",
  email: user?.email || "",
  phone: "",
  college: user?.college || "",
  remarks: "",
  });

  const isPaidEvent = Boolean(eventData?.isPaid && eventData?.price > 0);

  // Fetch event on mount
  useEffect(() => {
  const load = async () => {
  const res = await fetchEventById(eventId);
  if (res.success) setEventData(res.data);
  };
  load();
  }, [eventId, fetchEventById]);

  const handleChange = useCallback(
  (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value })),
  []
  );

  //  Validation 

  const isStep1Valid = formData.name.trim() && formData.phone.trim();

  const isSubmitReady = isPaidEvent ? Boolean(selectedGateway) : true;

  //  Payment handlers 

  const redirectToKhalti = async (registrationId) => {
  const CLIENT_URL = window.location.origin;
  const res = await initiateKhalti({
  return_url: `${CLIENT_URL}/payment-success`,
  website_url: CLIENT_URL,
  amount: Number(eventData.price) * 100, // paisa
  purchase_order_id: registrationId,
  purchase_order_name: eventData.title || "Event Registration",
  customer_info: {
  name: formData.name,
  email: formData.email,
  phone: formData.phone || "9800000000",
  },
  });

  if (res.success && res.payment_url) {
  window.location.href = res.payment_url;
  } else {
  throw new Error(res.message || "Khalti payment initiation failed.");
  }
  };

  const redirectToEsewa = (registrationId) => {
  toast.success("Redirecting to eSewa...");
  window.location.href = `/esewa-payment?request_id=${encodeURIComponent(registrationId)}`;
  };

  //  Submit 

  const handleSubmit = async () => {
  const token = localStorage.getItem("authToken");
  if (!token) {
  setError("Your session has expired. Please log in again.");
  return;
  }

  // Guard: paid event but no gateway selected
  if (isPaidEvent && !selectedGateway) {
  setError("Please select a payment gateway before continuing.");
  return;
  }

  setLoading(true);
  setError("");

  try {
  const result = await registerForEvent(eventId, formData);

  if (!result.success) {
  setError(result.message || "Registration was rejected by the server.");
  return;
  }

  // Free event - done
  if (!isPaidEvent) {
  toast.success("Registration successful!");
  onSuccess();
  return;
  }

  // Paid event - extract registration ID
  const registrationId = result.data?.registration?._id;
  if (!registrationId) {
  setError("Server did not return a registration ID. Please contact support.");
  return;
  }

  if (selectedGateway === "khalti") {
  await redirectToKhalti(registrationId);
  } else if (selectedGateway === "esewa") {
  redirectToEsewa(registrationId);
  }
  } catch (err) {
  console.error(err);
  setError(err.message || "An unexpected error occurred.");
  } finally {
  setLoading(false);
  }
  };

  //  Render 

  return (
  <div className="bg-white rounded-3xl p-7 md:p-10 max-w-lg w-full mx-auto border border-slate-100 shadow-2xl shadow-slate-200/60 mt-8">
  <StepBar currentStep={step} />

  {/* Error banner */}
  {error && (
  <div className="flex items-start gap-3 bg-rose-50 border border-rose-200 text-rose-700 px-5 py-4 rounded-2xl text-sm mb-6">
  <AlertCircle size={18} className="shrink-0 mt-0.5" />
  <p className="font-medium">{error}</p>
  </div>
  )}

  {/*  Step 1: Personal  */}
  {step === 1 && (
  <div className="space-y-5 animate-in fade-in slide-in-from-left-3 duration-300">
  <div className="mb-6 flex items-center gap-4">
  {user?.profilePicture && (
  <img
  src={`${import.meta.env.VITE_BASE_API_URL}${user.profilePicture}`}
  alt="Profile"
  className="w-12 h-12 rounded-full object-cover border-2 border-indigo-100 shadow-sm shrink-0"
  onError={(e) => {
  e.target.onerror = null;
  e.target.style.display = "none";
  }}
  />
  )}
  <div>
  <h3 className="text-2xl font-bold text-slate-800">Personal Details</h3>
  <p className="text-slate-400 text-sm mt-1">Tell us a bit about yourself.</p>
  </div>
  </div>
  <div>
  <FieldLabel>Full Name</FieldLabel>
  <Input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Your full name" />
  </div>
  <div>
  <FieldLabel>Email Address</FieldLabel>
  <Input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="name@example.com" />
  </div>
  <div>
  <FieldLabel>Phone Number</FieldLabel>
  <Input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+977 98XXXXXXXX" />
  </div>
  </div>
  )}

  {/*  Step 2: Academic  */}
  {step === 2 && (
  <div className="space-y-5 animate-in fade-in slide-in-from-right-3 duration-300">
  <div className="mb-6">
  <h3 className="text-2xl font-bold text-slate-800">Academic Profile</h3>
  <p className="text-slate-400 text-sm mt-1">Your current institutional affiliation.</p>
  </div>
  <div>
  <FieldLabel>Institution / Organization</FieldLabel>
  <Input type="text" name="college" value={formData.college} onChange={handleChange} placeholder="University or organization name" />
  </div>
  <div>
  <FieldLabel>Additional Notes <span className="normal-case font-normal tracking-normal text-slate-300">(optional)</span></FieldLabel>
  <Textarea name="remarks" value={formData.remarks} onChange={handleChange} rows={4} placeholder="Dietary requirements, accessibility needs, etc." />
  </div>
  </div>
  )}

  {/*  Step 3: Confirm + Payment  */}
  {step === 3 && (
  <div className="space-y-6 animate-in fade-in slide-in-from-right-3 duration-300">
  <div className="mb-2">
  <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase">
  {isPaidEvent ? "Payment Terminal" : "Final Review"}
  </h3>
  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
  {isPaidEvent
  ? "Select Uplink Protocol"
  : "Verify Node Data"}
  </p>
  </div>

  {/* Summary */}
  <div className="bg-slate-50 rounded-2xl px-5 py-2 border border-slate-100">
  <SummaryRow label="Name" value={formData.name} />
  <SummaryRow label="Email" value={formData.email} />
  <SummaryRow label="Phone" value={formData.phone} />
  <SummaryRow label="Institution" value={formData.college} />
  </div>

  {/* Payment section - only for paid events */}
  {isPaidEvent && (
  <div className="space-y-4 pt-4 border-t border-slate-100">
  <div className="text-center mb-2">
  <FieldLabel>Secure Gateways</FieldLabel>
  </div>
  <div className="grid grid-cols-2 gap-3">
  {PAYMENT_GATEWAYS.map((gw) => (
  <GatewayOption
  key={gw.id}
  gateway={gw}
  selected={selectedGateway === gw.id}
  onSelect={(id) => {
  setSelectedGateway(id);
  setError(""); // clear any gateway-related error on selection
  }}
  />
  ))}
  </div>

  {/* Amount summary */}
  <div className="flex items-center justify-between bg-indigo-50 border border-indigo-100 px-5 py-4 rounded-2xl mt-2">
  <div>
  <p className="text-xs text-slate-500 font-medium">Total Due</p>
  <p className="text-2xl font-black text-indigo-600 mt-0.5">
  Rs. {eventData.price}
  </p>
  </div>
  {selectedGateway && (
  <div className="text-xs text-slate-400 text-right">
  <p>Via</p>
  <p className="font-bold text-slate-600 capitalize">{selectedGateway}</p>
  </div>
  )}
  </div>

  {/* Hint when no gateway selected */}
  {!selectedGateway && (
  <p className="text-xs text-amber-500 font-medium text-center pt-1">
  Select a payment gateway to continue
  </p>
  )}
  </div>
  )}
  </div>
  )}

  {/*  Navigation  */}
  <div className="mt-8 flex gap-3 pt-6 border-t border-slate-50">
  {step > 1 && (
  <button
  type="button"
  onClick={() => setStep((s) => s - 1)}
  className="px-5 py-3.5 rounded-xl font-semibold text-sm text-slate-400 border border-slate-100
  hover:bg-slate-50 hover:text-slate-700 transition-all flex items-center gap-1.5"
  >
  <ChevronLeft size={16} /> Back
  </button>
  )}

  {step < 3 ? (
  <button
  type="button"
  onClick={() => setStep((s) => s + 1)}
  disabled={step === 1 && !isStep1Valid}
  className="flex-1 bg-slate-900 text-white py-3.5 rounded-xl font-bold text-sm
  hover:bg-indigo-600 transition-all active:scale-95 flex items-center justify-center gap-2
  disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
  >
  Continue <ChevronRight size={16} />
  </button>
  ) : (
  <button
  type="button"
  onClick={handleSubmit}
  disabled={loading || !isSubmitReady}
  className="flex-1 bg-indigo-600 text-white py-3.5 rounded-xl font-bold text-sm
  hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2
  disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 shadow-lg shadow-indigo-200"
  >
  {loading ? (
  <>
  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
  Processing...
  </>
  ) : isPaidEvent ? (
  `Pay with ${selectedGateway ? selectedGateway.charAt(0).toUpperCase() + selectedGateway.slice(1) : "..."}`
  ) : (
  "Complete Registration"
  )}
  </button>
  )}
  </div>

  <div className="text-center mt-5">
  <button
  type="button"
  onClick={onClose}
  className="text-[10px] font-bold uppercase tracking-widest text-slate-300 hover:text-rose-400 transition-colors"
  >
  Cancel
  </button>
  </div>
  </div>
  );
};

export default RegistrationForm;