-- CreateTable
CREATE TABLE `nguoi_dung` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tai_khoan` VARCHAR(50) NOT NULL,
    `mat_khau` TEXT NOT NULL,
    `email` VARCHAR(100) NULL,
    `vai_tro` ENUM('ADMIN', 'GIAO_VIEN', 'HOC_SINH', 'PHU_HUYNH') NOT NULL,
    `ngay_tao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `nguoi_dung_tai_khoan_key`(`tai_khoan`),
    UNIQUE INDEX `nguoi_dung_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ho_so_giao_vien` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `ma_so_gv` VARCHAR(20) NOT NULL,
    `ho_ten` VARCHAR(100) NOT NULL,
    `chuyen_mon` VARCHAR(50) NULL,

    UNIQUE INDEX `ho_so_giao_vien_user_id_key`(`user_id`),
    UNIQUE INDEX `ho_so_giao_vien_ma_so_gv_key`(`ma_so_gv`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ho_so_hoc_sinh` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `ma_so_hs` VARCHAR(20) NOT NULL,
    `ho_ten` VARCHAR(100) NOT NULL,
    `ngay_sinh` DATE NULL,
    `lop_id` INTEGER NULL,

    UNIQUE INDEX `ho_so_hoc_sinh_user_id_key`(`user_id`),
    UNIQUE INDEX `ho_so_hoc_sinh_ma_so_hs_key`(`ma_so_hs`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nam_hoc` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ten_nam_hoc` VARCHAR(20) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mon_hoc` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ten_mon` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lop_hoc` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nam_hoc_id` INTEGER NULL,
    `ten_lop` VARCHAR(20) NOT NULL,
    `gv_chu_nhiem_id` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ngan_hang_cau_hoi` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `mon_hoc_id` INTEGER NOT NULL,
    `gv_tao_id` INTEGER NULL,
    `noi_dung_cau_hoi` TEXT NOT NULL,
    `loai_cau_hoi` ENUM('TRAC_NGHIEM', 'TU_LUAN') NOT NULL,
    `dap_an_dung` TEXT NULL,
    `loi_giai_chi_tiet` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `de_kiem_tra` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `mon_hoc_id` INTEGER NOT NULL,
    `gv_tao_id` INTEGER NULL,
    `tieu_de` VARCHAR(255) NOT NULL,
    `loai_bai_thi` VARCHAR(50) NULL,
    `thoi_gian_lam_bai` INTEGER NULL,
    `han_nop_bai` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chi_tiet_de_thi` (
    `de_thi_id` INTEGER NOT NULL,
    `cau_hoi_id` INTEGER NOT NULL,
    `thu_tu_cau` INTEGER NULL,

    PRIMARY KEY (`de_thi_id`, `cau_hoi_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lich_su_nop_bai` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `de_thi_id` INTEGER NOT NULL,
    `hoc_sinh_id` INTEGER NOT NULL,
    `lan_nop` INTEGER NULL DEFAULT 1,
    `noi_dung_bai_lam` TEXT NULL,
    `link_anh_chup_bai` TEXT NULL,
    `thoi_gian_nop` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `trang_thai` VARCHAR(20) NULL DEFAULT 'CHO_CHAM',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chi_tiet_tra_loi_trac_nghiem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nop_bai_id` INTEGER NOT NULL,
    `cau_hoi_id` INTEGER NOT NULL,
    `cau_tra_loi_cua_hs` TEXT NULL,
    `la_dung` BOOLEAN NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ket_qua_cham_diem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nop_bai_id` INTEGER NOT NULL,
    `gv_cham_id` INTEGER NULL,
    `diem_so` DECIMAL(4, 2) NULL,
    `nhan_xet_cua_gv` TEXT NULL,
    `ngay_cham` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `banner` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tieu_de` VARCHAR(255) NULL,
    `mo_ta` TEXT NULL,
    `hinh_anh` VARCHAR(255) NOT NULL,
    `lien_ket` VARCHAR(255) NULL,
    `thu_tu` INTEGER NOT NULL DEFAULT 0,
    `kich_hoat` BOOLEAN NOT NULL DEFAULT true,
    `ngay_tao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ngay_cap_nhat` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bai_viet` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tieu_de` VARCHAR(255) NOT NULL,
    `duong_dan` VARCHAR(255) NOT NULL,
    `tom_tat` TEXT NULL,
    `noi_dung` LONGTEXT NOT NULL,
    `anh_bia` VARCHAR(255) NULL,
    `loai` ENUM('TIN_TUC', 'SU_KIEN', 'THONG_BAO_CHUNG', 'HUONG_DAN') NOT NULL DEFAULT 'TIN_TUC',
    `da_xuat_ban` BOOLEAN NOT NULL DEFAULT false,
    `luot_xem` INTEGER NOT NULL DEFAULT 0,
    `nguoi_tao_id` INTEGER NULL,
    `ngay_tao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ngay_cap_nhat` DATETIME(3) NOT NULL,

    UNIQUE INDEX `bai_viet_duong_dan_key`(`duong_dan`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `binh_luan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `bai_viet_id` INTEGER NOT NULL,
    `nguoi_dung_id` INTEGER NOT NULL,
    `noi_dung` TEXT NOT NULL,
    `binh_luan_cha_id` INTEGER NULL,
    `ngay_tao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ngay_cap_nhat` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `thong_bao` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nguoi_nhan_id` INTEGER NOT NULL,
    `tieu_de` VARCHAR(150) NOT NULL,
    `noi_dung` TEXT NOT NULL,
    `loai` ENUM('HE_THONG', 'CA_NHAN', 'HOC_TAP', 'TIN_NHAN') NOT NULL DEFAULT 'HE_THONG',
    `lien_ket` VARCHAR(255) NULL,
    `da_doc` BOOLEAN NOT NULL DEFAULT false,
    `ngay_tao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kenh_chat` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ten_kenh` VARCHAR(100) NULL,
    `loai_kenh` ENUM('CA_NHAN', 'NHOM', 'LOP_HOC') NOT NULL DEFAULT 'CA_NHAN',
    `anh_dai_dien` VARCHAR(255) NULL,
    `ngay_tao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ngay_cap_nhat` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `thanh_vien_kenh` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `kenh_chat_id` INTEGER NOT NULL,
    `nguoi_dung_id` INTEGER NOT NULL,
    `vai_tro` ENUM('QUAN_TRI', 'THANH_VIEN') NOT NULL DEFAULT 'THANH_VIEN',
    `ngay_tham_gia` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `thanh_vien_kenh_kenh_chat_id_nguoi_dung_id_key`(`kenh_chat_id`, `nguoi_dung_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tin_nhan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `kenh_chat_id` INTEGER NOT NULL,
    `nguoi_gui_id` INTEGER NOT NULL,
    `noi_dung` TEXT NULL,
    `loai` ENUM('VAN_BAN', 'HINH_ANH', 'TEP_TIN') NOT NULL DEFAULT 'VAN_BAN',
    `duong_dan_tep` TEXT NULL,
    `ngay_gui` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `da_sua` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ho_so_giao_vien` ADD CONSTRAINT `ho_so_giao_vien_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `nguoi_dung`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ho_so_hoc_sinh` ADD CONSTRAINT `ho_so_hoc_sinh_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `nguoi_dung`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ho_so_hoc_sinh` ADD CONSTRAINT `ho_so_hoc_sinh_lop_id_fkey` FOREIGN KEY (`lop_id`) REFERENCES `lop_hoc`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lop_hoc` ADD CONSTRAINT `lop_hoc_nam_hoc_id_fkey` FOREIGN KEY (`nam_hoc_id`) REFERENCES `nam_hoc`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lop_hoc` ADD CONSTRAINT `lop_hoc_gv_chu_nhiem_id_fkey` FOREIGN KEY (`gv_chu_nhiem_id`) REFERENCES `ho_so_giao_vien`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ngan_hang_cau_hoi` ADD CONSTRAINT `ngan_hang_cau_hoi_mon_hoc_id_fkey` FOREIGN KEY (`mon_hoc_id`) REFERENCES `mon_hoc`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ngan_hang_cau_hoi` ADD CONSTRAINT `ngan_hang_cau_hoi_gv_tao_id_fkey` FOREIGN KEY (`gv_tao_id`) REFERENCES `ho_so_giao_vien`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `de_kiem_tra` ADD CONSTRAINT `de_kiem_tra_mon_hoc_id_fkey` FOREIGN KEY (`mon_hoc_id`) REFERENCES `mon_hoc`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `de_kiem_tra` ADD CONSTRAINT `de_kiem_tra_gv_tao_id_fkey` FOREIGN KEY (`gv_tao_id`) REFERENCES `ho_so_giao_vien`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chi_tiet_de_thi` ADD CONSTRAINT `chi_tiet_de_thi_de_thi_id_fkey` FOREIGN KEY (`de_thi_id`) REFERENCES `de_kiem_tra`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chi_tiet_de_thi` ADD CONSTRAINT `chi_tiet_de_thi_cau_hoi_id_fkey` FOREIGN KEY (`cau_hoi_id`) REFERENCES `ngan_hang_cau_hoi`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lich_su_nop_bai` ADD CONSTRAINT `lich_su_nop_bai_de_thi_id_fkey` FOREIGN KEY (`de_thi_id`) REFERENCES `de_kiem_tra`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lich_su_nop_bai` ADD CONSTRAINT `lich_su_nop_bai_hoc_sinh_id_fkey` FOREIGN KEY (`hoc_sinh_id`) REFERENCES `ho_so_hoc_sinh`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chi_tiet_tra_loi_trac_nghiem` ADD CONSTRAINT `chi_tiet_tra_loi_trac_nghiem_nop_bai_id_fkey` FOREIGN KEY (`nop_bai_id`) REFERENCES `lich_su_nop_bai`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chi_tiet_tra_loi_trac_nghiem` ADD CONSTRAINT `chi_tiet_tra_loi_trac_nghiem_cau_hoi_id_fkey` FOREIGN KEY (`cau_hoi_id`) REFERENCES `ngan_hang_cau_hoi`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ket_qua_cham_diem` ADD CONSTRAINT `ket_qua_cham_diem_nop_bai_id_fkey` FOREIGN KEY (`nop_bai_id`) REFERENCES `lich_su_nop_bai`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ket_qua_cham_diem` ADD CONSTRAINT `ket_qua_cham_diem_gv_cham_id_fkey` FOREIGN KEY (`gv_cham_id`) REFERENCES `ho_so_giao_vien`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bai_viet` ADD CONSTRAINT `bai_viet_nguoi_tao_id_fkey` FOREIGN KEY (`nguoi_tao_id`) REFERENCES `nguoi_dung`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `binh_luan` ADD CONSTRAINT `binh_luan_bai_viet_id_fkey` FOREIGN KEY (`bai_viet_id`) REFERENCES `bai_viet`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `binh_luan` ADD CONSTRAINT `binh_luan_nguoi_dung_id_fkey` FOREIGN KEY (`nguoi_dung_id`) REFERENCES `nguoi_dung`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `binh_luan` ADD CONSTRAINT `binh_luan_binh_luan_cha_id_fkey` FOREIGN KEY (`binh_luan_cha_id`) REFERENCES `binh_luan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `thong_bao` ADD CONSTRAINT `thong_bao_nguoi_nhan_id_fkey` FOREIGN KEY (`nguoi_nhan_id`) REFERENCES `nguoi_dung`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `thanh_vien_kenh` ADD CONSTRAINT `thanh_vien_kenh_kenh_chat_id_fkey` FOREIGN KEY (`kenh_chat_id`) REFERENCES `kenh_chat`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `thanh_vien_kenh` ADD CONSTRAINT `thanh_vien_kenh_nguoi_dung_id_fkey` FOREIGN KEY (`nguoi_dung_id`) REFERENCES `nguoi_dung`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tin_nhan` ADD CONSTRAINT `tin_nhan_kenh_chat_id_fkey` FOREIGN KEY (`kenh_chat_id`) REFERENCES `kenh_chat`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tin_nhan` ADD CONSTRAINT `tin_nhan_nguoi_gui_id_fkey` FOREIGN KEY (`nguoi_gui_id`) REFERENCES `nguoi_dung`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
