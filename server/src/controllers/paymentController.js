import { khaltiPayment, khaltiLookup } from "../utils/khaltiAPI.js";
import { generateEsewaSignature, verifyEsewaStatus } from "../utils/esewaAPI.js";
import Registration from "../models/Registration.js";
import Event from "../models/Events.js";
import mongoose from "mongoose";

/**
 * ==========================================
 * KHALTI PAYMENT GATEWAY
 * ==========================================
 */

// Initiate Khalti Payment
export const initiateKhaltiPayment = async (req, res) => {
  try {
  const { purchase_order_id: registrationId } = req.body;

  if (!registrationId) {
  return res
  .status(400)
  .json({ success: false, message: "purchase_order_id is required" });
  }

  // Amount and ownership are resolved from the database, never from the
  // client, so a user cannot pay an arbitrary (or tiny) amount.
  const registration = await Registration.findById(registrationId);
  if (!registration) {
  return res
  .status(404)
  .json({ success: false, message: "Registration not found" });
  }

  if (registration.user.toString() !== req.user.id) {
  return res.status(403).json({
  success: false,
  message: "You cannot pay for someone else's registration",
  });
  }

  if (registration.status === "Confirmed") {
  return res.status(409).json({
  success: false,
  message: "This registration is already confirmed",
  });
  }

  const event = await Event.findById(registration.event);
  if (!event) {
  return res
  .status(404)
  .json({ success: false, message: "Event not found" });
  }

  const CLIENT_URL = process.env.FRONTEND_URL || "http://localhost:5173";

  // Khalti expects the amount in paisa
  const amountInPaisa = Math.round(Number(event.price) * 100);
  if (!amountInPaisa || amountInPaisa <= 0) {
  return res.status(409).json({
  success: false,
  message: "This event has no payable price configured",
  });
  }

  // Build payload for Khalti API v2
  const payload = {
  return_url: `${CLIENT_URL}/payment-success`,
  website_url: CLIENT_URL,
  amount: amountInPaisa,
  purchase_order_id: registrationId,
  purchase_order_name: String(event.title || "Event Registration").slice(0, 100),
  customer_info: {
  name: registration.name || "Customer",
  email: registration.email || "",
  phone: registration.phone || "",
  },
  };

  console.log(` [KHALTI] Initiating Payment for Order: ${payload.purchase_order_id}`);
  const result = await khaltiPayment(payload);

  // Save pidx to the registration immediately so we can find it later
  if (result.pidx) {
  await Registration.findByIdAndUpdate(registrationId, {
  "paymentInfo.pidx": result.pidx,
  "paymentInfo.amount": Number(event.price),
  });
  console.log(` [KHALTI] Saved PIDX ${result.pidx} to registration ${registrationId}`);
  }

  res.json({
  success: true,
  pidx: result.pidx,
  payment_url: result.payment_url,
  });
  } catch (error) {
  console.error(" [KHALTI] Initiation failed:", error.response?.data || error.message);
  res.status(500).json({
  success: false,
  message: "Khalti payment initiation failed",
  error: error.response?.data || error.message,
  });
  }
};

// Verify Khalti Payment
export const verifyKhaltiPayment = async (req, res) => {
  try {
  const { pidx } = req.body;
  if (!pidx) return res.status(400).json({ success: false, message: "PIDX is required" });

  console.log(` [KHALTI] Verifying PIDX: ${pidx}`);
  const result = await khaltiLookup(pidx);
  
  if (result.status === "Completed") {
  const actualAmount = result.total_amount || result.amount || 0;
  
  // Use pidx to find the registration since purchase_order_id might be missing
  const isFinalized = await finalizeRegistrationByPidx(pidx, {
  gateway: "khalti",
  amount: Number(actualAmount) / 100, 
  transactionId: result.transaction_id,
  });

  if (!isFinalized) {
  console.error(` [KHALTI] Settlement failed for PIDX: ${pidx}`);
  return res.status(404).json({ 
  success: false, 
  message: "Could not find or update registration with this PIDX.",
  data: result 
  });
  }

  return res.json({
  success: true,
  message: "Payment verified and registration confirmed!",
  data: result
  });
  }

  res.json({ success: false, message: `Payment is ${result.status}`, data: result });
  } catch (error) {
  console.error(" [KHALTI] Verification failed:", error.response?.data || error.message);
  res.status(500).json({ success: false, message: "Payment verification failed" });
  }
};

/**
 * ==========================================
 * ESEWA PAYMENT GATEWAY
 * ==========================================
 */

// Generate eSewa Form Data
export const getEsewaPaymentForm = async (req, res) => {
  try {
  const { request_id } = req.query;
  if (!request_id) {
  return res
  .status(400)
  .json({ success: false, message: "Missing required fields" });
  }

  // The amount is resolved from the database and ownership is verified, so
  // a user cannot generate a signed form for someone else's registration or
  // for an arbitrary amount.
  const registration = await Registration.findById(request_id);
  if (!registration) {
  return res
  .status(404)
  .json({ success: false, message: "Registration not found" });
  }

  if (registration.user.toString() !== req.user.id) {
  return res.status(403).json({
  success: false,
  message: "You cannot pay for someone else's registration",
  });
  }

  if (registration.status === "Confirmed") {
  return res.status(409).json({
  success: false,
  message: "This registration is already confirmed",
  });
  }

  const event = await Event.findById(registration.event);
  if (!event) {
  return res
  .status(404)
  .json({ success: false, message: "Event not found" });
  }

  const amountNum = Number(event.price);
  if (!amountNum || amountNum <= 0) {
  return res.status(409).json({
  success: false,
  message: "This event has no payable price configured",
  });
  }

  const ESEWA_MERCHANT_ID = process.env.ESEWA_MERCHANT_ID;
  const ESEWA_FORM_URL = process.env.ESEWA_FORM_URL || "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
  const CLIENT_URL = process.env.FRONTEND_URL || "http://localhost:5173";

  const signatureMessage = `total_amount=${amountNum},transaction_uuid=${request_id},product_code=${ESEWA_MERCHANT_ID}`;
  const signature = generateEsewaSignature(signatureMessage);

  const formData = {
  action: ESEWA_FORM_URL,
  amount: amountNum,
  tax_amount: 0,
  total_amount: amountNum,
  transaction_uuid: request_id,
  product_code: ESEWA_MERCHANT_ID,
  product_service_charge: 0,
  product_delivery_charge: 0,
  success_url: `${CLIENT_URL}/payment-success`,
  failure_url: `${CLIENT_URL}/payment-success`,
  signed_field_names: "total_amount,transaction_uuid,product_code",
  signature,
  };

  res.json({ success: true, data: formData });
  } catch (error) {
  console.error(" [ESEWA] Form generation failed:", error.message);
  res.status(500).json({ success: false, message: "Failed to generate eSewa form" });
  }
};

// Verify eSewa Payment
export const verifyEsewaPayment = async (req, res) => {
  try {
  const { request_id, transaction_code } = req.body;

  if (!request_id) {
  return res
  .status(400)
  .json({ success: false, message: "request_id is required" });
  }

  // Ownership is checked before anything is confirmed, and the amount sent
  // to eSewa comes from the database rather than the request body.
  const registration = await Registration.findById(request_id);
  if (!registration) {
  return res
  .status(404)
  .json({ success: false, message: "Registration not found" });
  }

  if (registration.user.toString() !== req.user.id) {
  return res.status(403).json({
  success: false,
  message: "You cannot verify someone else's payment",
  });
  }

  const amount = Number(registration.paymentInfo?.amount) || 0;
  if (!amount) {
  return res.status(409).json({
  success: false,
  message: "No recorded amount for this registration",
  });
  }

  console.log(` [ESEWA] Verifying Transaction: ${transaction_code}`);
  const statusData = await verifyEsewaStatus({
  amount,
  transaction_uuid: request_id,
  });

  if (statusData.status === "COMPLETE" || statusData.status === "SUCCESS") {
  await finalizeRegistration(request_id, {
  gateway: "esewa",
  amount,
  transactionId: transaction_code,
  reference_code: statusData.reference_code,
  });

  return res.json({
  success: true,
  message: "Payment verified successfully!",
  data: statusData
  });
  }

  res.json({ success: false, message: "Payment not completed", data: statusData });
  } catch (error) {
  console.error(" [ESEWA] Verification failed:", error.message);
  res.status(500).json({ success: false, message: "Payment verification failed" });
  }
};

/**
 * ==========================================
 * SHARED HELPER FUNCTIONS
 * ==========================================
 */

// Confirmation logic using pidx (More robust for Khalti)
const finalizeRegistrationByPidx = async (pidx, paymentInfo) => {
  console.log(` [PAYMENT] Finalizing by PIDX: "${pidx}"`);
  
  try {
  const updatedRegistration = await Registration.findOneAndUpdate(
  { "paymentInfo.pidx": pidx, status: "Pending" },
  {
  $set: {
  status: "Confirmed",
  paymentService: "Khalti",
  "paymentInfo.amount": paymentInfo.amount,
  "paymentInfo.transactionId": paymentInfo.transactionId,
  "paymentInfo.paymentDate": new Date(),
  }
  },
  { new: true }
  );

  if (!updatedRegistration) {
  // Check if it's already confirmed
  const alreadyDone = await Registration.findOne({ "paymentInfo.pidx": pidx, status: "Confirmed" });
  if (alreadyDone) return true;
  
  return false;
  }

  console.log(` [PAYMENT] Confirmed registration: ${updatedRegistration._id}`);
  await Event.findByIdAndUpdate(updatedRegistration.event, {
  $inc: { currentParticipants: 1 },
  });

  return true;
  } catch (error) {
  console.error(` [PAYMENT] Error using pidx:`, error.message);
  return false;
  }
};

// Generic finalization using ID (Still needed for eSewa)
const finalizeRegistration = async (registrationId, paymentInfo) => {
  console.log(` [PAYMENT] Finalizing by ID: "${registrationId}"`);
  
  try {
  const queryId = mongoose.Types.ObjectId.isValid(registrationId) 
  ? new mongoose.Types.ObjectId(registrationId) 
  : registrationId;

  const updatedRegistration = await Registration.findOneAndUpdate(
  { _id: queryId, status: "Pending" },
  {
  $set: {
  status: "Confirmed",
  paymentService: paymentInfo.gateway === "khalti" ? "Khalti" : "eSewa",
  "paymentInfo.amount": Number(paymentInfo.amount),
  "paymentInfo.transactionId": paymentInfo.transactionId,
  "paymentInfo.paymentDate": new Date(),
  }
  },
  { new: true }
  );

  if (!updatedRegistration) {
  const checkAgain = await Registration.findById(queryId);
  if (checkAgain && checkAgain.status === "Confirmed") return true;
  return false;
  }

  await Event.findByIdAndUpdate(updatedRegistration.event, {
  $inc: { currentParticipants: 1 },
  });
  return true;
  } catch (error) {
  console.error(` [PAYMENT] Error finalization:`, error.message);
  return false;
  }
};
