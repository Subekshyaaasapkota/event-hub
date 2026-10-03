import express from "express";
import {
  initiateKhaltiPayment,
  verifyKhaltiPayment,
  getEsewaPaymentForm,
  verifyEsewaPayment
} from "../controllers/paymentController.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

/**
 *  Khalti Routes
 */
router.post("/khalti/initiate", auth, initiateKhaltiPayment);
router.post("/khalti/verify", auth, verifyKhaltiPayment);

/**
 *  eSewa Routes
 * Both require a signed-in user: the registration referenced by request_id must
 * belong to the caller.
 */
router.get("/esewa/form", auth, getEsewaPaymentForm);
router.post("/esewa/verify", auth, verifyEsewaPayment);

export default router;
