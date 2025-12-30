/*
  Warnings:

  - A unique constraint covering the columns `[cccd]` on the table `ho_so_giao_vien` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cccd]` on the table `ho_so_hoc_sinh` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `ho_so_giao_vien` ADD COLUMN `cccd` VARCHAR(20) NULL,
    ADD COLUMN `dia_chi` VARCHAR(255) NULL,
    ADD COLUMN `email_lien_he` VARCHAR(100) NULL,
    ADD COLUMN `gioi_tinh` ENUM('NAM', 'NU', 'KHAC') NOT NULL DEFAULT 'NAM',
    ADD COLUMN `ngay_cap_cccd` DATE NULL,
    ADD COLUMN `ngay_sinh` DATE NULL,
    ADD COLUMN `ngay_vao_lam` DATE NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `noi_cap_cccd` VARCHAR(100) NULL,
    ADD COLUMN `so_dien_thoai` VARCHAR(15) NULL,
    ADD COLUMN `trinh_do` ENUM('CAO_DANG', 'DAI_HOC', 'THAC_SI', 'TIEN_SI', 'KHAC') NOT NULL DEFAULT 'DAI_HOC';

-- AlterTable
ALTER TABLE `ho_so_hoc_sinh` ADD COLUMN `cccd` VARCHAR(20) NULL,
    ADD COLUMN `dan_toc` VARCHAR(50) NULL,
    ADD COLUMN `dia_chi_tam_tru` VARCHAR(255) NULL,
    ADD COLUMN `dia_chi_thuong_tru` VARCHAR(255) NULL,
    ADD COLUMN `gioi_tinh` ENUM('NAM', 'NU', 'KHAC') NOT NULL DEFAULT 'NAM',
    ADD COLUMN `ho_ten_cha` VARCHAR(100) NULL,
    ADD COLUMN `ho_ten_me` VARCHAR(100) NULL,
    ADD COLUMN `ngay_cap_cccd` DATE NULL,
    ADD COLUMN `ngay_nhap_hoc` DATE NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `nghe_nghiep_cha` VARCHAR(100) NULL,
    ADD COLUMN `nghe_nghiep_me` VARCHAR(100) NULL,
    ADD COLUMN `noi_cap_cccd` VARCHAR(100) NULL,
    ADD COLUMN `noi_sinh` VARCHAR(100) NULL,
    ADD COLUMN `sdt_cha` VARCHAR(15) NULL,
    ADD COLUMN `sdt_me` VARCHAR(15) NULL,
    ADD COLUMN `so_dien_thoai` VARCHAR(15) NULL,
    ADD COLUMN `ton_giao` VARCHAR(50) NULL,
    ADD COLUMN `trang_thai` ENUM('DANG_HOC', 'BAO_LUU', 'THOI_HOC', 'TOT_NGHIEP', 'CHUYEN_TRUONG') NOT NULL DEFAULT 'DANG_HOC';

-- CreateIndex
CREATE UNIQUE INDEX `ho_so_giao_vien_cccd_key` ON `ho_so_giao_vien`(`cccd`);

-- CreateIndex
CREATE UNIQUE INDEX `ho_so_hoc_sinh_cccd_key` ON `ho_so_hoc_sinh`(`cccd`);
