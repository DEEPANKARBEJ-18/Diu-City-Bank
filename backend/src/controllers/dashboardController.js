const pool = require("../config/db");

exports.stats = async (req, res, next) => {
  try {
    const [[customers]] = await pool.query("SELECT COUNT(*) AS count FROM customers");
    const [[accounts]] = await pool.query("SELECT COUNT(*) AS count FROM accounts WHERE status = 'active'");
    const [[deposits]] = await pool.query(
      "SELECT COALESCE(SUM(balance), 0) AS total FROM accounts WHERE status = 'active'"
    );
    const [[todayTx]] = await pool.query(
      "SELECT COUNT(*) AS count FROM transactions WHERE DATE(created_at) = CURDATE()"
    );

    const [recent] = await pool.query(
      `SELECT t.id, t.type, t.amount, t.created_at, a.account_number, c.full_name AS customer_name
       FROM transactions t
       JOIN accounts a ON a.id = t.account_id
       JOIN customers c ON c.id = a.customer_id
       ORDER BY t.created_at DESC
       LIMIT 8`
    );

    res.json({
      customers: customers.count,
      accounts: accounts.count,
      totalDeposits: deposits.total,
      todayTransactions: todayTx.count,
      recent,
    });
  } catch (err) {
    next(err);
  }
};
