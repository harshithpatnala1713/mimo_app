-- ============================================================
-- metalinv — full schema
-- Run once: mysql -u root -p < db/schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS metalinv
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE metalinv;

-- ── users ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(180) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('supplier','customer') NOT NULL DEFAULT 'customer',
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ── metal_types ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS metal_types (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  code       VARCHAR(40)  NOT NULL UNIQUE,
  name       VARCHAR(120) NOT NULL,
  grade      VARCHAR(60),
  category   VARCHAR(80)  NOT NULL,
  density    DECIMAL(10,4),
  unit       VARCHAR(20)  DEFAULT 'kg/m³',
  status     ENUM('Active','Inactive') DEFAULT 'Active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ── coil_stock ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coil_stock (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  coil_id        VARCHAR(60) NOT NULL UNIQUE,
  metal_type_id  INT NOT NULL,
  supplier_name  VARCHAR(120),
  heat_no        VARCHAR(60),
  width          DECIMAL(10,2),
  thickness      DECIMAL(10,3),
  gross_weight   DECIMAL(10,2),
  current_weight DECIMAL(10,2),
  location       VARCHAR(80),
  status         ENUM('Available','In Use','Low Stock','Depleted','Reserved') DEFAULT 'Available',
  received_date  DATE,
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (metal_type_id) REFERENCES metal_types(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ── orders ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  customer_id   INT NOT NULL,
  customer_name VARCHAR(120) NOT NULL,
  metal_type    VARCHAR(120) NOT NULL,
  quantity      DECIMAL(10,2) NOT NULL,
  width         DECIMAL(10,2),
  thickness     DECIMAL(10,3),
  notes         TEXT,
  contact_name  VARCHAR(120),
  contact_info  VARCHAR(180),
  status        ENUM('Pending','Approved','Rejected') DEFAULT 'Pending',
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── cut_plans ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cut_plans (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  sheet_width DECIMAL(10,2) NOT NULL,
  remaining   DECIMAL(10,2) NOT NULL DEFAULT 0,
  utilization DECIMAL(5,2)  NOT NULL DEFAULT 0,
  source      ENUM('new_sheet','inventory') DEFAULT 'new_sheet',
  coil_id     INT,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ── cut_plan_items ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cut_plan_items (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  plan_id      INT NOT NULL,
  order_id     INT NOT NULL,
  cut_width    DECIMAL(10,2) NOT NULL,
  position     DECIMAL(10,2) NOT NULL DEFAULT 0,
  FOREIGN KEY (plan_id)  REFERENCES cut_plans(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id)    ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── seed: default users (passwords set by scripts/seedPasswords.js) ──
-- supplier@metalinv.com / supplier123
-- customer@metalinv.com / customer123
