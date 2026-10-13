const express = require("express");
const auth = require("../middleware/auth");
const controller = require("../controllers/transactionController");

const router = express.Router();
const staff = auth(["admin", "staff"]);

router.get("/", staff, controller.list);
router.post("/transfer", staff, controller.transfer);

module.exports = router;
