-- CreateTable
CREATE TABLE `nguoi_dung` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tai_khoan` VARCHAR(50) NOT NULL,
    `mat_khau` TEXT NULL,
    `email` VARCHAR(100) NULL,
    `google_id` VARCHAR(255) NULL,
    `vai_tro` ENUM('ADMIN', 'NHAN_VIEN', 'GIAO_VIEN', 'HOC_SINH', 'PHU_HUYNH') NOT NULL,
    `ngay_tao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `nguoi_dung_tai_khoan_key`(`tai_khoan`),
    UNIQUE INDEX `nguoi_dung_email_key`(`email`),
    UNIQUE INDEX `nguoi_dung_google_id_key`(`google_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ho_so_giao_vien` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `ma_so_gv` VARCHAR(20) NOT NULL,
    `ho_ten` VARCHAR(100) NOT NULL,
    `ngay_sinh` DATE NULL,
    `gioi_tinh` ENUM('NAM', 'NU', 'KHAC') NOT NULL DEFAULT 'NAM',
    `dia_chi` VARCHAR(255) NULL,
    `so_dien_thoai` VARCHAR(15) NULL,
    `email_lien_he` VARCHAR(100) NULL,
    `cccd` VARCHAR(20) NULL,
    `ngay_cap_cccd` DATE NULL,
    `noi_cap_cccd` VARCHAR(100) NULL,
    `trinh_do` ENUM('CAO_DANG', 'DAI_HOC', 'THAC_SI', 'TIEN_SI', 'KHAC') NOT NULL DEFAULT 'DAI_HOC',
    `chuyen_mon` VARCHAR(50) NULL,
    `ngay_vao_lam` DATE NULL,

    UNIQUE INDEX `ho_so_giao_vien_user_id_key`(`user_id`),
    UNIQUE INDEX `ho_so_giao_vien_ma_so_gv_key`(`ma_so_gv`),
    UNIQUE INDEX `ho_so_giao_vien_cccd_key`(`cccd`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ho_so_hoc_sinh` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `ma_so_hs` VARCHAR(20) NOT NULL,
    `ho_ten` VARCHAR(100) NOT NULL,
    `ngay_sinh` DATE NULL,
    `gioi_tinh` ENUM('NAM', 'NU', 'KHAC') NOT NULL DEFAULT 'NAM',
    `noi_sinh` VARCHAR(100) NULL,
    `dan_toc` VARCHAR(50) NULL,
    `ton_giao` VARCHAR(50) NULL,
    `dia_chi_thuong_tru` VARCHAR(255) NULL,
    `dia_chi_tam_tru` VARCHAR(255) NULL,
    `so_dien_thoai` VARCHAR(15) NULL,
    `cccd` VARCHAR(20) NULL,
    `ngay_cap_cccd` DATE NULL,
    `noi_cap_cccd` VARCHAR(100) NULL,
    `ho_ten_cha` VARCHAR(100) NULL,
    `nghe_nghiep_cha` VARCHAR(100) NULL,
    `sdt_cha` VARCHAR(15) NULL,
    `ho_ten_me` VARCHAR(100) NULL,
    `nghe_nghiep_me` VARCHAR(100) NULL,
    `sdt_me` VARCHAR(15) NULL,
    `ngay_nhap_hoc` DATE NULL,
    `trang_thai` ENUM('DANG_HOC', 'BAO_LUU', 'THOI_HOC', 'TOT_NGHIEP', 'CHUYEN_TRUONG') NOT NULL DEFAULT 'DANG_HOC',
    `lop_id` INTEGER NULL,

    UNIQUE INDEX `ho_so_hoc_sinh_user_id_key`(`user_id`),
    UNIQUE INDEX `ho_so_hoc_sinh_ma_so_hs_key`(`ma_so_hs`),
    UNIQUE INDEX `ho_so_hoc_sinh_cccd_key`(`cccd`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ho_so_nhan_vien` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `ma_so` VARCHAR(20) NOT NULL,
    `ho_ten` VARCHAR(100) NOT NULL,
    `ngay_sinh` DATE NULL,
    `gioi_tinh` ENUM('NAM', 'NU', 'KHAC') NOT NULL DEFAULT 'NAM',
    `dia_chi` VARCHAR(255) NULL,
    `so_dien_thoai` VARCHAR(15) NULL,
    `email_lien_he` VARCHAR(100) NULL,
    `cccd` VARCHAR(20) NULL,

    UNIQUE INDEX `ho_so_nhan_vien_user_id_key`(`user_id`),
    UNIQUE INDEX `ho_so_nhan_vien_ma_so_key`(`ma_so`),
    UNIQUE INDEX `ho_so_nhan_vien_cccd_key`(`cccd`),
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
    `vai_tro_phe_duyet` ENUM('ADMIN', 'NHAN_VIEN', 'GIAO_VIEN', 'HOC_SINH', 'PHU_HUYNH') NOT NULL,

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
    `danh_muc_id` INTEGER NULL,
    `trang_thai` ENUM('NHAP', 'HOAT_DONG', 'NGUNG_HOAT_DONG') NOT NULL DEFAULT 'NHAP',
    `nguoi_tao_id` INTEGER NOT NULL,
    `ngay_tao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ngay_cap_nhat` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `danh_muc_quy_trinh` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ten` VARCHAR(100) NOT NULL,
    `mo_ta` TEXT NULL,
    `ngay_tao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

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
    `loai_nguoi_phe_duyet` ENUM('NGUOI_DUNG', 'VAI_TRO', 'NGUOI_DUNG_CU_THE') NOT NULL,
    `approver_id` INTEGER NULL,
    `approver_role` VARCHAR(191) NULL,
    `ngay_tao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `truong_form_quy_trinh` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `quy_trinh_id` INTEGER NOT NULL,
    `ten_truong` VARCHAR(100) NOT NULL,
    `nhan` VARCHAR(255) NOT NULL,
    `loai` ENUM('TEXT', 'LONG_TEXT', 'NUMBER', 'TEXTAREA', 'SELECT', 'CHECKBOX', 'RADIO', 'DATE', 'TIME', 'FILE') NOT NULL,
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
    `trang_thai` ENUM('CHO_DUYET', 'DANG_XU_LY', 'DA_DUYET', 'TU_CHOI', 'HUY_BO') NOT NULL DEFAULT 'CHO_DUYET',
    `buoc_hien_tai` INTEGER NOT NULL DEFAULT 1,
    `du_lieu_form` LONGTEXT NULL,
    `nguoi_tao_id` INTEGER NOT NULL,
    `ngay_tao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `phien_quy_trinh_quy_trinh_id_idx`(`quy_trinh_id`),
    INDEX `phien_quy_trinh_nguoi_tao_id_idx`(`nguoi_tao_id`),
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

    INDEX `buoc_phien_quy_trinh_phien_id_idx`(`phien_id`),
    INDEX `buoc_phien_quy_trinh_buoc_id_idx`(`buoc_id`),
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

    INDEX `nhat_ky_phe_duyet_quy_trinh_phien_id_idx`(`phien_id`),
    INDEX `nhat_ky_phe_duyet_quy_trinh_nguoi_dung_id_idx`(`nguoi_dung_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ho_so_giao_vien` ADD CONSTRAINT `ho_so_giao_vien_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `nguoi_dung`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ho_so_hoc_sinh` ADD CONSTRAINT `ho_so_hoc_sinh_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `nguoi_dung`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ho_so_hoc_sinh` ADD CONSTRAINT `ho_so_hoc_sinh_lop_id_fkey` FOREIGN KEY (`lop_id`) REFERENCES `lop_hoc`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ho_so_nhan_vien` ADD CONSTRAINT `ho_so_nhan_vien_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `nguoi_dung`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lop_hoc` ADD CONSTRAINT `lop_hoc_nam_hoc_id_fkey` FOREIGN KEY (`nam_hoc_id`) REFERENCES `nam_hoc`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lop_hoc` ADD CONSTRAINT `lop_hoc_gv_chu_nhiem_id_fkey` FOREIGN KEY (`gv_chu_nhiem_id`) REFERENCES `ho_so_giao_vien`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lich_hoc` ADD CONSTRAINT `lich_hoc_lop_id_fkey` FOREIGN KEY (`lop_id`) REFERENCES `lop_hoc`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lich_hoc` ADD CONSTRAINT `lich_hoc_mon_hoc_id_fkey` FOREIGN KEY (`mon_hoc_id`) REFERENCES `mon_hoc`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lich_hoc` ADD CONSTRAINT `lich_hoc_gv_day_id_fkey` FOREIGN KEY (`gv_day_id`) REFERENCES `ho_so_giao_vien`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

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
ALTER TABLE `quy_trinh` ADD CONSTRAINT `quy_trinh_danh_muc_id_fkey` FOREIGN KEY (`danh_muc_id`) REFERENCES `danh_muc_quy_trinh`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

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
