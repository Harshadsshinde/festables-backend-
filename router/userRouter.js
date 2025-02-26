// routes/userRoutes.js
import express from "express";
import {
  patientRegister,
  login,
  addNewAdmin,
  addNewDoctor,
  getAllDoctors,
  getUserDetails,
  logoutAdmin,
  logoutPatient,
  loginOrRegister, // if using a combined login/register endpoint
} from "../controller/userController.js";
import {
  isAdminAuthenticated,
  isPatientAuthenticated,
} from "../middlewares/auth.js";

const router = express.Router();

// Public route for patient registration
router.post("/patient/register", patientRegister);

// Public route for login (or combined login/register)
router.post("/loginOrRegister", loginOrRegister);
// Alternatively, if separate, use router.post("/login", login);

// Protected routes (require authentication)
router.post("/admin/addnew", isAdminAuthenticated, addNewAdmin);
router.post("/doctor/addnew", isAdminAuthenticated, addNewDoctor);
router.get("/doctors", isAdminAuthenticated, getAllDoctors);
router.get("/patient/me", isPatientAuthenticated, getUserDetails);
router.get("/admin/me", isAdminAuthenticated, getUserDetails);
router.get("/patient/logout", isPatientAuthenticated, logoutPatient);
router.get("/admin/logout", isAdminAuthenticated, logoutAdmin);

export default router;
