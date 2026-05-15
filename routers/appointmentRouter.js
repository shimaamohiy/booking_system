const express = require("express");
const router = express.Router();
const {
  createAppointment,
  updateAppointment,
  getAppointments,
  cancelAppointment
} = require("../controllers/appointmentController");

const { verifyToken,checkRole } = require("../middlewares/auth");

router.post("/", verifyToken, checkRole(['user']),createAppointment);
router.get("/", verifyToken, getAppointments);
router.put("/:id", verifyToken,checkRole(['user', 'professional']), updateAppointment);
router.delete("/:id", verifyToken,checkRole(['user', 'professional', 'admin']),cancelAppointment);

module.exports = router;
