const pool = require("../config/db");

async function getActiveAccount(conn, id) {
  const [rows] = await conn.query("SELECT * FROM accounts WHERE id = ? FOR UPDATE", [id]);
  const account = rows[0];
  if (!account) {
    const err = new Error("Account not found");
    err.status = 404;
    throw err;
  }
  if (account.status !== "active") {
    const err = new Error("Account is not active");
    err.status = 400;
    throw err;
  }
  return account;
}

exports.list = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT t.*, a.account_number, c.full_name AS customer_name
       FROM transactions t
       JOIN accounts a ON a.id = t.account_id
       JOIN customers c ON c.id = a.customer_id
       ORDER BY t.created_at DESC
       LIMIT 200`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.listByAccount = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM transactions WHERE account_id = ? ORDER BY created_at DESC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.deposit = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const amount = Number(req.body.amount);
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    await conn.beginTransaction();
    const account = await getActiveAccount(conn, req.params.id);
    const newBalance = Number(account.balance) + amount;

    await conn.query("UPDATE accounts SET balance = ? WHERE id = ?", [newBalance, account.id]);
    await conn.query(
      `INSERT INTO transactions (account_id, type, amount, balance_after, description, created_by)
       VALUES (?, 'deposit', ?, ?, ?, ?)`,
      [account.id, amount, newBalance, req.body.description || "Cash deposit", req.user.id]
    );
    await conn.commit();

    res.json({ account_id: account.id, balance: newBalance });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
};

exports.withdraw = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const amount = Number(req.body.amount);
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    await conn.beginTransaction();
    const account = await getActiveAccount(conn, req.params.id);
    if (Number(account.balance) < amount) {
      await conn.rollback();
      return res.status(400).json({ message: "Insufficient balance" });
    }

    const newBalance = Number(account.balance) - amount;
    await conn.query("UPDATE accounts SET balance = ? WHERE id = ?", [newBalance, account.id]);
    await conn.query(
      `INSERT INTO transactions (account_id, type, amount, balance_after, description, created_by)
       VALUES (?, 'withdraw', ?, ?, ?, ?)`,
      [account.id, amount, newBalance, req.body.description || "Cash withdrawal", req.user.id]
    );
    await conn.commit();

    res.json({ account_id: account.id, balance: newBalance });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
};

exports.transfer = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const { from_account_id, to_account_number, amount, description } = req.body;
    const value = Number(amount);
    if (!from_account_id || !to_account_number || !value || value <= 0) {
      return res.status(400).json({ message: "from_account_id, to_account_number, and a positive amount are required" });
    }

    await conn.beginTransaction();
    const from = await getActiveAccount(conn, from_account_id);

    const [destRows] = await conn.query(
      "SELECT * FROM accounts WHERE account_number = ? FOR UPDATE",
      [to_account_number]
    );
    const to = destRows[0];
    if (!to) {
      await conn.rollback();
      return res.status(404).json({ message: "Destination account not found" });
    }
    if (to.status !== "active") {
      await conn.rollback();
      return res.status(400).json({ message: "Destination account is not active" });
    }
    if (from.id === to.id) {
      await conn.rollback();
      return res.status(400).json({ message: "Cannot transfer to the same account" });
    }
    if (Number(from.balance) < value) {
      await conn.rollback();
      return res.status(400).json({ message: "Insufficient balance" });
    }

    const fromBalance = Number(from.balance) - value;
    const toBalance = Number(to.balance) + value;

    await conn.query("UPDATE accounts SET balance = ? WHERE id = ?", [fromBalance, from.id]);
    await conn.query("UPDATE accounts SET balance = ? WHERE id = ?", [toBalance, to.id]);

    await conn.query(
      `INSERT INTO transactions (account_id, related_account_id, type, amount, balance_after, description, created_by)
       VALUES (?, ?, 'transfer_out', ?, ?, ?, ?)`,
      [from.id, to.id, value, fromBalance, description || `Transfer to ${to.account_number}`, req.user.id]
    );
    await conn.query(
      `INSERT INTO transactions (account_id, related_account_id, type, amount, balance_after, description, created_by)
       VALUES (?, ?, 'transfer_in', ?, ?, ?, ?)`,
      [to.id, from.id, value, toBalance, description || `Transfer from ${from.account_number}`, req.user.id]
    );

    await conn.commit();
    res.json({ from_balance: fromBalance, to_account_number: to.account_number, to_balance: toBalance });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
};
