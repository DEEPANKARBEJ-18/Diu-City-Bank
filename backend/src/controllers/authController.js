const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

function signToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role, customerId: user.customer_id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
  );
}

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      token: signToken(user),
      user: { id: user.id, name: user.name, email: user.email, role: user.role, customerId: user.customer_id },
    });
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, email, role, customer_id AS customerId FROM users WHERE id = ?",
      [req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ message: "User not found" });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};
