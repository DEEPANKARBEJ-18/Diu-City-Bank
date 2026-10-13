const pool = require("../config/db");

exports.list = async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT * FROM customers ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT * FROM customers WHERE id = ?", [req.params.id]);
    if (!rows[0]) return res.status(404).json({ message: "Customer not found" });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { full_name, email, phone, address, nid, date_of_birth } = req.body;
    if (!full_name || !email || !phone || !address || !nid || !date_of_birth) {
      return res.status(400).json({ message: "All customer fields are required" });
    }

    const [result] = await pool.query(
      `INSERT INTO customers (full_name, email, phone, address, nid, date_of_birth)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [full_name, email, phone, address, nid, date_of_birth]
    );

    const [rows] = await pool.query("SELECT * FROM customers WHERE id = ?", [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { full_name, email, phone, address, nid, date_of_birth, status } = req.body;
    const [existing] = await pool.query("SELECT id FROM customers WHERE id = ?", [req.params.id]);
    if (!existing[0]) return res.status(404).json({ message: "Customer not found" });

    await pool.query(
      `UPDATE customers
       SET full_name = ?, email = ?, phone = ?, address = ?, nid = ?, date_of_birth = ?, status = ?
       WHERE id = ?`,
      [full_name, email, phone, address, nid, date_of_birth, status || "active", req.params.id]
    );

    const [rows] = await pool.query("SELECT * FROM customers WHERE id = ?", [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};
