-- CreateTable
CREATE TABLE `lich_hoc` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `lop_id` INTEGER NOT NULL,
    `mon_hoc_id` INTEGER NOT NULL,
    `gv_day_id` INTEGER NULL,
    `thu` INTEGER NOT NULL,
    `tiet_bat_dau` INTEGER NOT NULL,
    `so_tiet` INTEGER NOT NULL,
    `phong_hoc` VARCHAR(50) NULL,
    `ngay_tao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lich_su_dang_nhap` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `thoi_gian` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ip_address` VARCHAR(50) NULL,
    `thiet_bi` TEXT NULL,
    `trang_thai` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `loai_phe_duyet` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ten_loai` VARCHAR(100) NOT NULL,
    `ma_loai` VARCHAR(50) NOT NULL,
    `mo_ta` TEXT NULL,
    `cau_hinh_form` LONGTEXT NULL,
    `ngay_tao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ngay_cap_nhat` DATETIME(3) NOT NULL,

    UNIQUE INDEX `loai_phe_duyet_ma_loai_key`(`ma_loai`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `buoc_phe_duyet` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `loai_phe_duyet_id` INTEGER NOT NULL,
    `ten_buoc` VARCHAR(100) NOT NULL,
    `thu_tu` INTEGER NOT NULL,
    `vai_tro_phe_duyet` ENUM('ADMIN', 'GIAO_VIEN', 'HOC_SINH', 'PHU_HUYNH') NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `don_phe_duyet` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `loai_phe_duyet_id` INTEGER NOT NULL,
    `nguoi_yeu_cau_id` INTEGER NOT NULL,
    `nguoi_duyet_id` INTEGER NULL,
    `tieu_de` VARCHAR(255) NOT NULL,
    `du_lieu_form` LONGTEXT NOT NULL,
    `trang_thai` ENUM('CHO_DUYET', 'DANG_XU_LY', 'DA_DUYET', 'TU_CHOI', 'HUY_BO') NOT NULL DEFAULT 'CHO_DUYET',
    `buoc_hien_tai` INTEGER NOT NULL DEFAULT 1,
    `ngay_tao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ngay_cap_nhat` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lich_su_phe_duyet` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `don_id` INTEGER NOT NULL,
    `buoc_id` INTEGER NOT NULL,
    `nguoi_duyet_id` INTEGER NULL,
    `hanh_dong` ENUM('CHO_DUYET', 'DANG_XU_LY', 'DA_DUYET', 'TU_CHOI', 'HUY_BO') NOT NULL,
    `ghi_chu` TEXT NULL,
    `ngay_tao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `thread` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tac_gia_id` INTEGER NOT NULL,
    `noi_dung` LONGTEXT NOT NULL,
    `hinh_anh` TEXT NULL,
    `thread_cha_id` INTEGER NULL,
    `luot_xem` INTEGER NOT NULL DEFAULT 0,
    `ngay_tao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ngay_cap_nhat` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `thread_like` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `thread_id` INTEGER NOT NULL,
    `nguoi_dung_id` INTEGER NOT NULL,
    `ngay_tao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `thread_like_thread_id_nguoi_dung_id_key`(`thread_id`, `nguoi_dung_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `thread_repost` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `thread_id` INTEGER NOT NULL,
    `nguoi_dung_id` INTEGER NOT NULL,
    `ngay_tao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `thread_repost_thread_id_nguoi_dung_id_key`(`thread_id`, `nguoi_dung_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `flow_theo_doi` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nguoi_theo_doi_id` INTEGER NOT NULL,
    `nguoi_duoc_theo_doi_id` INTEGER NOT NULL,
    `ngay_tao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `flow_theo_doi_nguoi_theo_doi_id_nguoi_duoc_theo_doi_id_key`(`nguoi_theo_doi_id`, `nguoi_duoc_theo_doi_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ket_ban` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nguoi_gui_id` INTEGER NOT NULL,
    `nguoi_nhan_id` INTEGER NOT NULL,
    `trang_thai` ENUM('CHO_XAC_NHAN', 'DA_KET_BAN', 'BI_CHAN') NOT NULL DEFAULT 'CHO_XAC_NHAN',
    `ngay_tao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ngay_cap_nhat` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ket_ban_nguoi_gui_id_nguoi_nhan_id_key`(`nguoi_gui_id`, `nguoi_nhan_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `quy_trinh` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ten` VARCHAR(255) NOT NULL,
    `mo_ta` TEXT NULL,
    `trang_thai` ENUM('NHAP', 'HOAT_DONG', 'NGUNG_HOAT_DONG') NOT NULL DEFAULT 'NHAP',
    `nguoi_tao_id` INTEGER NOT NULL,
    `ngay_tao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ngay_cap_nhat` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `buoc_quy_trinh` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `quy_trinh_id` INTEGER NOT NULL,
    `thu_tu_buoc` INTEGER NOT NULL,
    `ten` VARCHAR(100) NOT NULL,
    `loai_quy_tac` ENUM('BAT_KY', 'TAT_CA') NOT NULL DEFAULT 'BAT_KY',
    `ngay_tao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nguoi_phe_duyet_buoc` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `buoc_id` INTEGER NOT NULL,
    `loai_nguoi_phe_duyet` ENUM('NGUOI_DUNG', 'VAI_TRO', 'NHOM') NOT NULL,
    `approver_id` INTEGER NOT NULL,
    `ngay_tao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `truong_form_quy_trinh` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `quy_trinh_id` INTEGER NOT NULL,
    `ten_truong` VARCHAR(100) NOT NULL,
    `nhan` VARCHAR(255) NOT NULL,
    `loai` ENUM('TEXT', 'NUMBER', 'TEXTAREA', 'SELECT', 'DATE', 'DATETIME') NOT NULL,
    `bat_buoc` BOOLEAN NOT NULL DEFAULT false,
    `tuy_chon` JSON NULL,
    `thu_tu` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `phien_quy_trinh` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `quy_trinh_id` INTEGER NOT NULL,
    `doi_tuong_lien_quan` JSON NULL,
    `trang_thai` ENUM('CHO_DUYET', 'DA_DUYET', 'TU_CHOI', 'HUY_BO') NOT NULL DEFAULT 'CHO_DUYET',
    `buoc_hien_tai` INTEGER NOT NULL DEFAULT 1,
    `nguoi_tao_id` INTEGER NOT NULL,
    `ngay_tao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `buoc_phien_quy_trinh` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `phien_id` INTEGER NOT NULL,
    `buoc_id` INTEGER NOT NULL,
    `trang_thai` ENUM('CHO_DUYET', 'DA_DUYET', 'TU_CHOI', 'BO_QUA') NOT NULL DEFAULT 'CHO_DUYET',
    `nguoi_phe_duyet_id` INTEGER NULL,
    `ngay_phe_duyet` DATETIME(3) NULL,
    `ghi_chu` TEXT NULL,
    `ngay_tao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nhat_ky_phe_duyet_quy_trinh` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `phien_id` INTEGER NOT NULL,
    `buoc_id` INTEGER NULL,
    `nguoi_dung_id` INTEGER NOT NULL,
    `hanh_dong` ENUM('PHE_DUYET', 'TU_CHOI', 'YEU_CAU_CHINH_SUA') NOT NULL,
    `noi_dung` TEXT NULL,
    `ngay_tao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `lich_hoc` ADD CONSTRAINT `lich_hoc_lop_id_fkey` FOREIGN KEY (`lop_id`) REFERENCES `lop_hoc`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lich_hoc` ADD CONSTRAINT `lich_hoc_mon_hoc_id_fkey` FOREIGN KEY (`mon_hoc_id`) REFERENCES `mon_hoc`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lich_hoc` ADD CONSTRAINT `lich_hoc_gv_day_id_fkey` FOREIGN KEY (`gv_day_id`) REFERENCES `ho_so_giao_vien`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lich_su_dang_nhap` ADD CONSTRAINT `lich_su_dang_nhap_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `nguoi_dung`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `buoc_phe_duyet` ADD CONSTRAINT `buoc_phe_duyet_loai_phe_duyet_id_fkey` FOREIGN KEY (`loai_phe_duyet_id`) REFERENCES `loai_phe_duyet`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `don_phe_duyet` ADD CONSTRAINT `don_phe_duyet_loai_phe_duyet_id_fkey` FOREIGN KEY (`loai_phe_duyet_id`) REFERENCES `loai_phe_duyet`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `don_phe_duyet` ADD CONSTRAINT `don_phe_duyet_nguoi_yeu_cau_id_fkey` FOREIGN KEY (`nguoi_yeu_cau_id`) REFERENCES `nguoi_dung`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lich_su_phe_duyet` ADD CONSTRAINT `lich_su_phe_duyet_don_id_fkey` FOREIGN KEY (`don_id`) REFERENCES `don_phe_duyet`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lich_su_phe_duyet` ADD CONSTRAINT `lich_su_phe_duyet_buoc_id_fkey` FOREIGN KEY (`buoc_id`) REFERENCES `buoc_phe_duyet`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lich_su_phe_duyet` ADD CONSTRAINT `lich_su_phe_duyet_nguoi_duyet_id_fkey` FOREIGN KEY (`nguoi_duyet_id`) REFERENCES `nguoi_dung`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `thread` ADD CONSTRAINT `thread_tac_gia_id_fkey` FOREIGN KEY (`tac_gia_id`) REFERENCES `nguoi_dung`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `thread` ADD CONSTRAINT `thread_thread_cha_id_fkey` FOREIGN KEY (`thread_cha_id`) REFERENCES `thread`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `thread_like` ADD CONSTRAINT `thread_like_thread_id_fkey` FOREIGN KEY (`thread_id`) REFERENCES `thread`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `thread_like` ADD CONSTRAINT `thread_like_nguoi_dung_id_fkey` FOREIGN KEY (`nguoi_dung_id`) REFERENCES `nguoi_dung`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `thread_repost` ADD CONSTRAINT `thread_repost_thread_id_fkey` FOREIGN KEY (`thread_id`) REFERENCES `thread`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `thread_repost` ADD CONSTRAINT `thread_repost_nguoi_dung_id_fkey` FOREIGN KEY (`nguoi_dung_id`) REFERENCES `nguoi_dung`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `flow_theo_doi` ADD CONSTRAINT `flow_theo_doi_nguoi_theo_doi_id_fkey` FOREIGN KEY (`nguoi_theo_doi_id`) REFERENCES `nguoi_dung`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `flow_theo_doi` ADD CONSTRAINT `flow_theo_doi_nguoi_duoc_theo_doi_id_fkey` FOREIGN KEY (`nguoi_duoc_theo_doi_id`) REFERENCES `nguoi_dung`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ket_ban` ADD CONSTRAINT `ket_ban_nguoi_gui_id_fkey` FOREIGN KEY (`nguoi_gui_id`) REFERENCES `nguoi_dung`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ket_ban` ADD CONSTRAINT `ket_ban_nguoi_nhan_id_fkey` FOREIGN KEY (`nguoi_nhan_id`) REFERENCES `nguoi_dung`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quy_trinh` ADD CONSTRAINT `quy_trinh_nguoi_tao_id_fkey` FOREIGN KEY (`nguoi_tao_id`) REFERENCES `nguoi_dung`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `buoc_quy_trinh` ADD CONSTRAINT `buoc_quy_trinh_quy_trinh_id_fkey` FOREIGN KEY (`quy_trinh_id`) REFERENCES `quy_trinh`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nguoi_phe_duyet_buoc` ADD CONSTRAINT `nguoi_phe_duyet_buoc_buoc_id_fkey` FOREIGN KEY (`buoc_id`) REFERENCES `buoc_quy_trinh`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `truong_form_quy_trinh` ADD CONSTRAINT `truong_form_quy_trinh_quy_trinh_id_fkey` FOREIGN KEY (`quy_trinh_id`) REFERENCES `quy_trinh`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `phien_quy_trinh` ADD CONSTRAINT `phien_quy_trinh_quy_trinh_id_fkey` FOREIGN KEY (`quy_trinh_id`) REFERENCES `quy_trinh`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `phien_quy_trinh` ADD CONSTRAINT `phien_quy_trinh_nguoi_tao_id_fkey` FOREIGN KEY (`nguoi_tao_id`) REFERENCES `nguoi_dung`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `buoc_phien_quy_trinh` ADD CONSTRAINT `buoc_phien_quy_trinh_phien_id_fkey` FOREIGN KEY (`phien_id`) REFERENCES `phien_quy_trinh`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `buoc_phien_quy_trinh` ADD CONSTRAINT `buoc_phien_quy_trinh_buoc_id_fkey` FOREIGN KEY (`buoc_id`) REFERENCES `buoc_quy_trinh`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nhat_ky_phe_duyet_quy_trinh` ADD CONSTRAINT `nhat_ky_phe_duyet_quy_trinh_phien_id_fkey` FOREIGN KEY (`phien_id`) REFERENCES `phien_quy_trinh`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nhat_ky_phe_duyet_quy_trinh` ADD CONSTRAINT `nhat_ky_phe_duyet_quy_trinh_nguoi_dung_id_fkey` FOREIGN KEY (`nguoi_dung_id`) REFERENCES `nguoi_dung`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
