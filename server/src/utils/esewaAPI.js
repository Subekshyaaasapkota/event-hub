import fetch from "node-fetch";
import crypto from "crypto";

const ESEWA_MERCHANT_ID = process.env.ESEWA_MERCHANT_ID;
const ESEWA_SECRET_KEY = process.env.ESEWA_SECRET_KEY;
const ESEWA_API_URL = process.env.ESEWA_API_URL;

/**
 * Generate HMAC SHA256 hash for eSewa signature
 */
export const generateEsewaSignature = (data) => {
  if (!data || !ESEWA_SECRET_KEY) {
  throw new Error("Missing data or eSewa secret key for signature generation.");
  }
  return crypto
  .createHmac("sha256", ESEWA_SECRET_KEY)
  .update(data)
  .digest("base64");
};

/**
 * Verify eSewa status via API
 */
export const verifyEsewaStatus = async ({ amount, transaction_uuid }) => {
  const statusUrl = `${ESEWA_API_URL}/transaction/status/?product_code=${ESEWA_MERCHANT_ID}&total_amount=${amount}&transaction_uuid=${transaction_uuid}`;

  console.log(" [ESEWA-UTILS] Checking status via:", statusUrl);

  const response = await fetch(statusUrl, {
  method: "GET",
  headers: { "Content-Type": "application/json" },
  });

  return await response.json();
};
