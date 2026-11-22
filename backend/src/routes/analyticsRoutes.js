import express from "express";
import { getAdminStats } from "../controller/analyticsController.js";
import { admin } from "../middleware/adminMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get('/', protect, admin, getAdminStats);

export default router;
