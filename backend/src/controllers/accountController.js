const pool = require("../config/db");

function generateAccountNumber() {
  const n = Math.floor(10000000 + Math.random() * 90000000);
  return `DCB${n}`;
}

exports.list = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT a.*, c.full_name AS customer_name, c.email AS customer_email
       FROM accounts a
       JOIN customers c ON c.id = a.customer_id
       ORDER BY a.opened_at DESC`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT a.*, c.full_name AS customer_name, c.email AS customer_email, c.phone AS customer_phone
       FROM accounts a
       JOIN customers c ON c.id = a.customer_id
       WHERE a.id = ?`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ message: "Account not found" });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { customer_id, account_type, opening_balance } = req.body;
    if (!customer_id || !account_type) {
      return res.status(400).json({ message: "customer_id and account_type are required" });
    }
    if (!["savings", "current"].includes(account_type)) {
      return res.status(400).json({ message: "account_type must be savings or current" });
    }

    const [customers] = await pool.query("SELECT id FROM customers WHERE id = ?", [customer_id]);
    if (!customers[0]) return res.status(404).json({ message: "Customer not found" });

    const balance = Number(opening_balance) || 0;
    if (balance < 0) return res.status(400).json({ message: "Opening balance cannot be negative" });

    const accountNumber = generateAccountNumber();
    const [result] = await pool.query(
      `INSERT INTO accounts (account_number, customer_id, account_type, balance)
       VALUES (?, ?, ?, ?)`,
      [accountNumber, customer_id, account_type, balance]
    );

    if (balance > 0) {
      await pool.query(
        `INSERT INTO transactions (account_id, type, amount, balance_after, description, created_by)
         VALUES (?, 'deposit', ?, ?, 'Opening deposit', ?)`,
        [result.insertId, balance, balance, req.user.id]
      );
    }

    const [rows] = await pool.query("SELECT * FROM accounts WHERE id = ?", [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};
