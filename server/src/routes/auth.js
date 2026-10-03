import express from "express";
import {
  login,
  logout,
  register,
  getMe,
  updateProfile,
} from "../controllers/authController.js";
import auth from "../middlewares/auth.js";
import {
  uploadProfilePicture,
  handleMulterError,
} from "../middlewares/upload.js";

const router = express.Router();

router.post("/register", register);
router.get("/me", auth, getMe);
router.post("/login", login);
router.post("/logout", logout);
router.put(
  "/profile",
  [auth, uploadProfilePicture, handleMulterError],
  updateProfile,
);

export default router;
