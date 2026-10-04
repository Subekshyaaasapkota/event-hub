import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema(
  {
  event: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Event",
  required: true,
  },
  user: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  required: true,
  },
status: {
    type: String,
    enum: ["Confirmed", "Pending", "Cancelled", "Failed"],
    default: "Confirmed",
  },
  // While a paid registration sits at Pending it is holding a seat, and this is
  // when that hold runs out. Null for everything else, including every
  // confirmed seat and every free event.
  holdExpiresAt: {
    type: Date,
    default: null,
  },

  paymentInfo: {
  amount: Number,
  transactionId: String,
  pidx: String, // Store Khalti pidx for lookup
  paymentDate: Date,
  },
  paymentService: {
  type: String,
  enum: ["Khalti", "eSewa", "GoogleForm", "None"],
  default: "None",
  },
  // Custom form data for the specific event
  name: { type: String, trim: true, maxlength: 80 },
  email: { type: String, trim: true, lowercase: true, maxlength: 120 },
  phone: { type: String, trim: true, maxlength: 20 },
  college: { type: String, trim: true, maxlength: 160 },
  remarks: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true },
);

// Prevent duplicate registrations
registrationSchema.index({ event: 1, user: 1 }, { unique: true });

export default mongoose.model("Registration", registrationSchema);
