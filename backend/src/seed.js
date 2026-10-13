require("dotenv").config();
const bcrypt = require("bcryptjs");
const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

async function seed() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    multipleStatements: true,
  });

  const schema = fs.readFileSync(path.join(__dirname, "../../database/schema.sql"), "utf8");
  await connection.query(schema);

  const hash = await bcrypt.hash("Admin@123", 10);
  await connection.query(
    `INSERT INTO diu_city_bank.users (name, email, password_hash, role)
     VALUES (?, ?, ?, 'admin')
     ON DUPLICATE KEY UPDATE name = VALUES(name)`,
    ["Bank Admin", "admin@diucitybank.com", hash]
  );

  const [existing] = await connection.query("SELECT COUNT(*) AS count FROM diu_city_bank.customers");
  if (existing[0].count === 0) {
    await connection.query(
      `INSERT INTO diu_city_bank.customers (full_name, email, phone, address, nid, date_of_birth)
       VALUES
       ('Ayesha Rahman', 'ayesha@example.com', '01711000001', 'Dhanmondi, Dhaka', '1990123456', '1996-03-12'),
       ('Rahul Das', 'rahul@example.com', '01711000002', 'Agrabad, Chattogram', '1987654321', '1992-08-21')`
    );

    await connection.query(
      `INSERT INTO diu_city_bank.accounts (account_number, customer_id, account_type, balance)
       VALUES ('DCB10000001', 1, 'savings', 25000.00), ('DCB10000002', 2, 'current', 18000.00)`
    );

    await connection.query(
      `INSERT INTO diu_city_bank.transactions (account_id, type, amount, balance_after, description)
       VALUES
       (1, 'deposit', 25000.00, 25000.00, 'Opening deposit'),
       (2, 'deposit', 18000.00, 18000.00, 'Opening deposit')`
    );
  }

  await connection.end();
  console.log("Database ready. Login with admin@diucitybank.com / Admin@123");
}

seed().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
