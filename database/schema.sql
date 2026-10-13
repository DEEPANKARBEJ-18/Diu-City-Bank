CREATE DATABASE IF NOT EXISTS diu_city_bank;
USE diu_city_bank;

CREATE TABLE IF NOT EXISTS customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  phone VARCHAR(20) NOT NULL,
  address VARCHAR(255) NOT NULL,
  nid VARCHAR(30) NOT NULL UNIQUE,
  date_of_birth DATE NOT NULL,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'staff', 'customer') NOT NULL DEFAULT 'staff',
  customer_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_customer FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE IF NOT EXISTS accounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  account_number VARCHAR(20) NOT NULL UNIQUE,
  customer_id INT NOT NULL,
  account_type ENUM('savings', 'current') NOT NULL,
  balance DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
  status ENUM('active', 'frozen', 'closed') NOT NULL DEFAULT 'active',
  opened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_accounts_customer FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  account_id INT NOT NULL,
  related_account_id INT NULL,
  type ENUM('deposit', 'withdraw', 'transfer_in', 'transfer_out') NOT NULL,
  amount DECIMAL(14, 2) NOT NULL,
  balance_after DECIMAL(14, 2) NOT NULL,
  description VARCHAR(255),
  created_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_tx_account FOREIGN KEY (account_id) REFERENCES accounts(id),
  CONSTRAINT fk_tx_related FOREIGN KEY (related_account_id) REFERENCES accounts(id),
  CONSTRAINT fk_tx_user FOREIGN KEY (created_by) REFERENCES users(id)
);
