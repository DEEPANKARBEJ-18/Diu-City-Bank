const express = require("express");
const auth = require("../middleware/auth");
const controller = require("../controllers/customerController");

const router = express.Router();
const staff = auth(["admin", "staff"]);

router.get("/", staff, controller.list);
router.get("/:id", staff, controller.getOne);
router.post("/", staff, controller.create);
router.put("/:id", staff, controller.update);

module.exports = router;
