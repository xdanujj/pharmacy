import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import medicineRoutes from "./routes/medicineRoutes.js";
import prescriptionRoutes from "./routes/prescriptionRoutes.js";
import { errorHandler } from "./middleware/errorMiddleware.js";

const app = express();

// =====================
// GLOBAL MIDDLEWARE
// =====================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// =====================
// HEALTH / ROOT ROUTE
// =====================

app.get("/", (req, res) => {
  res.json({ message: "💊 Pharmacy Management API is running" });
});

// =====================
// API ROUTES
// =====================
app.use("/api/auth", authRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/prescriptions", prescriptionRoutes);

// =====================
// ERROR HANDLER (LAST)
// =====================
app.use(errorHandler);

export default app;
