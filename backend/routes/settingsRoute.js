import express from "express";
import { getSaleSettings, updateSaleSettings } from "../controllers/settingsController.js";
import adminAuth from "../middleware/adminAuth.js";

const settingsRouter = express.Router();

// Public: Get sale settings (for frontend banner)
settingsRouter.get("/sale", getSaleSettings);

// Admin: Update sale settings
settingsRouter.post("/sale", adminAuth, updateSaleSettings);

export default settingsRouter;
