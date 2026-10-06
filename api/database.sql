-- =============================================
-- Special Project System (SPS) Database Schema
-- Naval Civil Engineering CSR & Project Management Suite
-- Equal Opportunity Rotation & CMSys Bridge Enabled
-- =============================================

CREATE DATABASE IF NOT EXISTS special_projects_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE special_projects_db;

-- 1. Special Projects Master Table
CREATE TABLE IF NOT EXISTS `special_projects` (
  `id` VARCHAR(64) PRIMARY KEY,
  `code` VARCHAR(32) NOT NULL,
  `category` ENUM('Religious', 'Clean Sri Lanka', 'Housing', 'Miscellaneous') NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `location` VARCHAR(255) NOT NULL,
  `gps` VARCHAR(64) DEFAULT NULL,
  `status` ENUM('Active', 'On Hold', 'Completed') DEFAULT 'Active',
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `budget` DECIMAL(15, 2) DEFAULT 0.00,
  `approval_ref` VARCHAR(128) DEFAULT NULL,
  `approval_type` VARCHAR(64) DEFAULT 'Signal',
  `approval_authority` VARCHAR(255) DEFAULT NULL,
  `end_user_name` VARCHAR(255) DEFAULT NULL,
  `end_user_contact` VARCHAR(64) DEFAULT NULL,
  `incharge` VARCHAR(128) DEFAULT NULL,
  `work_scope` TEXT DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `progress` INT DEFAULT 0,
  `job_card_cost` DECIMAL(15, 2) DEFAULT 0.00,
  `material_status` ENUM('OK', 'Low', 'Critical') DEFAULT 'OK',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Trade Headcount Quotas per Project
CREATE TABLE IF NOT EXISTS `project_trade_quotas` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `project_id` VARCHAR(64) NOT NULL,
  `trade` VARCHAR(16) NOT NULL,
  `required_count` INT NOT NULL DEFAULT 1,
  FOREIGN KEY (`project_id`) REFERENCES `special_projects`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Labour Attachments Table (Equal Opportunity Rotation Tracking)
CREATE TABLE IF NOT EXISTS `labour_attachments` (
  `id` VARCHAR(64) PRIMARY KEY,
  `project_id` VARCHAR(64) NOT NULL,
  `official_number` VARCHAR(32) NOT NULL,
  `name` VARCHAR(128) NOT NULL,
  `rank` VARCHAR(32) NOT NULL,
  `trade` VARCHAR(16) NOT NULL,
  `from_date` DATE NOT NULL,
  `to_date` DATE NOT NULL,
  `days_attached` INT DEFAULT 1,
  `status` ENUM('Active', 'Inactive', 'Terminated') DEFAULT 'Active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`project_id`) REFERENCES `special_projects`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Job Cards Table
CREATE TABLE IF NOT EXISTS `job_cards` (
  `id` VARCHAR(64) PRIMARY KEY,
  `project_id` VARCHAR(64) NOT NULL,
  `job_number` VARCHAR(64) NOT NULL,
  `description` TEXT NOT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE DEFAULT NULL,
  `status` ENUM('Active', 'Completed', 'On Hold') DEFAULT 'Active',
  `material_cost` DECIMAL(15, 2) DEFAULT 0.00,
  `labour_hours` DECIMAL(10, 2) DEFAULT 0.00,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`project_id`) REFERENCES `special_projects`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Signals & Approval References Table
CREATE TABLE IF NOT EXISTS `project_documents` (
  `id` VARCHAR(64) PRIMARY KEY,
  `project_id` VARCHAR(64) NOT NULL,
  `type` VARCHAR(64) NOT NULL,
  `ref_no` VARCHAR(128) NOT NULL,
  `date` DATE NOT NULL,
  `authority` VARCHAR(255) DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`project_id`) REFERENCES `special_projects`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Weather & Site Logs Table
CREATE TABLE IF NOT EXISTS `weather_logs` (
  `id` VARCHAR(64) PRIMARY KEY,
  `project_id` VARCHAR(64) NOT NULL,
  `date` DATE NOT NULL,
  `condition` VARCHAR(64) NOT NULL,
  `icon` VARCHAR(16) DEFAULT '☀️',
  `temp` VARCHAR(16) DEFAULT '30°C',
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`project_id`) REFERENCES `special_projects`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. System User Profiles & Naval Roles Table
CREATE TABLE IF NOT EXISTS `user_profiles` (
  `id` VARCHAR(64) PRIMARY KEY,
  `name` VARCHAR(128) NOT NULL,
  `service_no` VARCHAR(32) NOT NULL,
  `role` ENUM('admin', 'cced_e', 'cceo_e', 'sce_ww', 'ce_ww', 'artificers', 'incharge') NOT NULL DEFAULT 'incharge',
  `designation` VARCHAR(128) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Naval Projects Master Table (Votes & Capital Works)
CREATE TABLE IF NOT EXISTS `naval_projects` (
  `id` VARCHAR(64) PRIMARY KEY,
  `code` VARCHAR(32) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `name_abbreviation` VARCHAR(32) DEFAULT NULL,
  `vote_number` VARCHAR(64) NOT NULL,
  `vote_allocation` DECIMAL(15, 2) DEFAULT 0.00,
  `committed` DECIMAL(15, 2) DEFAULT 0.00,
  `actual_spent` DECIMAL(15, 2) DEFAULT 0.00,
  `project_type` VARCHAR(64) DEFAULT 'New Construction',
  `financial_mean` VARCHAR(64) DEFAULT 'Vote',
  `benefactor` VARCHAR(128) DEFAULT 'Civil Works Dept',
  `project_officer` VARCHAR(128) DEFAULT NULL,
  `status` ENUM('Active', 'On Hold', 'Completed') DEFAULT 'Active',
  `start_date` DATE DEFAULT NULL,
  `end_date` DATE DEFAULT NULL,
  `work_scope` TEXT DEFAULT NULL,
  `progress` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. Procurement Files Table (PR Register & Present Position Stages)
CREATE TABLE IF NOT EXISTS `procurement_files` (
  `id` VARCHAR(64) PRIMARY KEY,
  `project_id` VARCHAR(64) NOT NULL,
  `project_code` VARCHAR(32) DEFAULT NULL,
  `pr_number` VARCHAR(128) NOT NULL,
  `item_code` VARCHAR(128) DEFAULT NULL,
  `item_name` TEXT NOT NULL,
  `unit` VARCHAR(32) DEFAULT "No's",
  `qty` DECIMAL(12, 2) DEFAULT 1.00,
  `unit_price` DECIMAL(15, 2) DEFAULT 0.00,
  `file_cost` DECIMAL(15, 2) DEFAULT 0.00,
  `supplier` VARCHAR(255) DEFAULT 'Naval Stores',
  `present_position` ENUM('Processing File', 'Awaiting Financial Approval', 'Order Placed', 'Items Dispatched', 'Items Received') DEFAULT 'Processing File',
  `authorized_by` VARCHAR(128) DEFAULT NULL,
  `created_by` VARCHAR(128) DEFAULT NULL,
  `file_group_key` VARCHAR(128) DEFAULT NULL,
  `file_date` DATE DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`project_id`) REFERENCES `naval_projects`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

