const express = require("express");
const auth = require("../middleware/auth");
const accounts = require("../controllers/accountController");
const tx = require("../controllers/transactionController");

const router = express.Router();
const staff = auth(["admin", "staff"]);

router.get("/", staff, accounts.list);
router.get("/:id", staff, accounts.getOne);
router.post("/", staff, accounts.create);
router.get("/:id/transactions", staff, tx.listByAccount);
router.post("/:id/deposit", staff, tx.deposit);
router.post("/:id/withdraw", staff, tx.withdraw);

module.exports = router;
