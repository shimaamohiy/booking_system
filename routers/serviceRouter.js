const express = require("express");
const router = express.Router();
const {
  createService,
  getAllServices,
  updateService,
  deleteService
} = require("../controllers/serviceController");

const { verifyToken,checkRole } = require("../middlewares/auth");

router.post('/', verifyToken,checkRole(['professional', 'admin']), createService);
router.get("/", verifyToken,checkRole(['professional', 'admin','user']),getAllServices);
// router.get("/:id", getServiceById);
router.put("/:id", verifyToken,checkRole(['professional', 'admin']), updateService);
router.delete("/:id", verifyToken,checkRole(['professional', 'admin']), deleteService);

module.exports = router;
