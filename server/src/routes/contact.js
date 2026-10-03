import { Router } from "express";
import { submitContactMessage } from "../controllers/contactController.js";

const router = Router();

// Public. The form is on the contact page and must work before sign in.
router.post("/", submitContactMessage);

export default router;
