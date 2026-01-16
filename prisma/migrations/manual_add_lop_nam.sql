-- Manual Migration Script: Add LopNam and HocSinhLopNam
-- This script safely migrates existing data to new structure

-- Step 1: Add new columns to lop_hoc
ALTER TABLE `lop_hoc` ADD COLUMN `khoi_lop` INT NULL AFTER `ten_lop`;
ALTER TABLE `lop_hoc` ADD COLUMN `mo_ta` TEXT NULL AFTER `khoi_lop`;

-- Step 2: Extract and populate khoi_lop from ten_lop
-- Assuming class names like "10A", "11B", "12C"
UPDATE `lop_hoc` 
SET `khoi_lop` = CAST(SUBSTRING(`ten_lop`, 1, 2) AS UNSIGNED)
WHERE `ten_lop` REGEXP '^[0-9]{2}';

-- Fallback for single digit grades
UPDATE `lop_hoc` 
SET `khoi_lop` = CAST(SUBSTRING(`ten_lop`, 1, 1) AS UNSIGNED)
WHERE `khoi_lop` IS NULL AND `ten_lop` REGEXP '^[0-9]';

-- Step 3: Make khoi_lop NOT NULL after population
ALTER TABLE `lop_hoc` MODIFY COLUMN `khoi_lop` INT NOT NULL;

-- Step 4: Create lop_nam table
CREATE TABLE `lop_nam` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `lop_id` INT NOT NULL,
  `nam_hoc_id` INT NOT NULL,
  `gv_chu_nhiem_id` INT NULL,
  `si_so` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `lop_nam_lop_id_nam_hoc_id_key` (`lop_id`, `nam_hoc_id`),
  KEY `lop_nam_lop_id_idx` (`lop_id`),
  KEY `lop_nam_nam_hoc_id_idx` (`nam_hoc_id`),
  KEY `lop_nam_gv_chu_nhiem_id_idx` (`gv_chu_nhiem_id`),
  CONSTRAINT `lop_nam_lop_id_fkey` FOREIGN KEY (`lop_id`) REFERENCES `lop_hoc` (`id`) ON DELETE CASCADE,
  CONSTRAINT `lop_nam_nam_hoc_id_fkey` FOREIGN KEY (`nam_hoc_id`) REFERENCES `nam_hoc` (`id`) ON DELETE CASCADE,
  CONSTRAINT `lop_nam_gv_chu_nhiem_id_fkey` FOREIGN KEY (`gv_chu_nhiem_id`) REFERENCES `ho_so_giao_vien` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 5: Migrate existing LopHoc -> LopNam
INSERT INTO `lop_nam` (`lop_id`, `nam_hoc_id`, `gv_chu_nhiem_id`, `si_so`)
SELECT 
  `id` as `lop_id`,
  `nam_hoc_id`,
  `gv_chu_nhiem_id`,
  (SELECT COUNT(*) FROM `ho_so_hoc_sinh` WHERE `lop_id` = `lop_hoc`.`id`) as `si_so`
FROM `lop_hoc`
WHERE `nam_hoc_id` IS NOT NULL;

-- Step 6: Create hoc_sinh_lop_nam table
CREATE TABLE `hoc_sinh_lop_nam` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `hoc_sinh_id` INT NOT NULL,
  `lop_nam_id` INT NOT NULL,
  `ngay_vao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `ngay_ra` DATETIME(3) NULL,
  `trang_thai` ENUM('DANG_HOC', 'BAO_LUU', 'THOI_HOC', 'TOT_NGHIEP', 'CHUYEN_TRUONG') NOT NULL DEFAULT 'DANG_HOC',
  PRIMARY KEY (`id`),
  UNIQUE KEY `hoc_sinh_lop_nam_hoc_sinh_id_lop_nam_id_key` (`hoc_sinh_id`, `lop_nam_id`),
  KEY `hoc_sinh_lop_nam_hoc_sinh_id_idx` (`hoc_sinh_id`),
  KEY `hoc_sinh_lop_nam_lop_nam_id_idx` (`lop_nam_id`),
  CONSTRAINT `hoc_sinh_lop_nam_hoc_sinh_id_fkey` FOREIGN KEY (`hoc_sinh_id`) REFERENCES `ho_so_hoc_sinh` (`id`) ON DELETE CASCADE,
  CONSTRAINT `hoc_sinh_lop_nam_lop_nam_id_fkey` FOREIGN KEY (`lop_nam_id`) REFERENCES `lop_nam` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 7: Migrate student assignments
INSERT INTO `hoc_sinh_lop_nam` (`hoc_sinh_id`, `lop_nam_id`, `trang_thai`, `ngay_vao`)
SELECT 
  hs.`id` as `hoc_sinh_id`,
  ln.`id` as `lop_nam_id`,
  hs.`trang_thai`,
  COALESCE(hs.`ngay_nhap_hoc`, NOW()) as `ngay_vao`
FROM `ho_so_hoc_sinh` hs
INNER JOIN `lop_hoc` lh ON hs.`lop_id` = lh.`id`
INNER JOIN `lop_nam` ln ON ln.`lop_id` = lh.`id` AND ln.`nam_hoc_id` = lh.`nam_hoc_id`
WHERE hs.`lop_id` IS NOT NULL;

-- Step 8: Create lich_hoc_new table
CREATE TABLE `lich_hoc_new` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `lop_nam_id` INT NOT NULL,
  `mon_hoc_id` INT NOT NULL,
  `gv_day_id` INT NULL,
  `thu` INT NOT NULL,
  `tiet_bat_dau` INT NOT NULL,
  `so_tiet` INT NOT NULL,
  `phong_hoc` VARCHAR(50) NULL,
  `ngay_tao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `lich_hoc_new_lop_nam_id_idx` (`lop_nam_id`),
  KEY `lich_hoc_new_mon_hoc_id_idx` (`mon_hoc_id`),
  KEY `lich_hoc_new_gv_day_id_idx` (`gv_day_id`),
  CONSTRAINT `lich_hoc_new_lop_nam_id_fkey` FOREIGN KEY (`lop_nam_id`) REFERENCES `lop_nam` (`id`) ON DELETE CASCADE,
  CONSTRAINT `lich_hoc_new_mon_hoc_id_fkey` FOREIGN KEY (`mon_hoc_id`) REFERENCES `mon_hoc` (`id`) ON DELETE CASCADE,
  CONSTRAINT `lich_hoc_new_gv_day_id_fkey` FOREIGN KEY (`gv_day_id`) REFERENCES `ho_so_giao_vien` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 9: Migrate schedule data
INSERT INTO `lich_hoc_new` (`lop_nam_id`, `mon_hoc_id`, `gv_day_id`, `thu`, `tiet_bat_dau`, `so_tiet`, `phong_hoc`, `ngay_tao`)
SELECT 
  ln.`id` as `lop_nam_id`,
  lh.`mon_hoc_id`,
  lh.`gv_day_id`,
  lh.`thu`,
  lh.`tiet_bat_dau`,
  lh.`so_tiet`,
  lh.`phong_hoc`,
  lh.`ngay_tao`
FROM `lich_hoc` lh
INNER JOIN `lop_hoc` l ON lh.`lop_id` = l.`id`
INNER JOIN `lop_nam` ln ON ln.`lop_id` = l.`id` AND ln.`nam_hoc_id` = l.`nam_hoc_id`
WHERE l.`nam_hoc_id` IS NOT NULL;

-- Step 10: Verification queries (run these to check data integrity)
-- SELECT COUNT(*) as total_classes FROM lop_hoc;
-- SELECT COUNT(*) as total_class_years FROM lop_nam;
-- SELECT COUNT(*) as total_student_assignments FROM hoc_sinh_lop_nam;
-- SELECT COUNT(*) as old_schedules FROM lich_hoc;
-- SELECT COUNT(*) as new_schedules FROM lich_hoc_new;

-- IMPORTANT: After verification, you can optionally:
-- 1. Drop old foreign keys from lop_hoc (nam_hoc_id, gv_chu_nhiem_id)
-- 2. Drop lop_id from ho_so_hoc_sinh
-- 3. Rename lich_hoc_new to lich_hoc (after backing up old lich_hoc)
