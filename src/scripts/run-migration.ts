import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function runMigration() {
  try {
    console.log('🚀 Starting manual migration...\n');

    // Step 1: Add khoi_lop column
    console.log('Step 1: Adding khoi_lop column to lop_hoc...');
    try {
      await prisma.$executeRaw`ALTER TABLE lop_hoc ADD COLUMN khoi_lop INT NULL AFTER ten_lop`;
      console.log('✅ Column added');
    } catch (e: any) {
      if (e.message.includes('Duplicate column')) {
        console.log('⚠️  Column already exists, skipping');
      } else throw e;
    }

    // Step 2: Add mo_ta column
    console.log('\nStep 2: Adding mo_ta column to lop_hoc...');
    try {
      await prisma.$executeRaw`ALTER TABLE lop_hoc ADD COLUMN mo_ta TEXT NULL AFTER khoi_lop`;
      console.log('✅ Column added');
    } catch (e: any) {
      if (e.message.includes('Duplicate column')) {
        console.log('⚠️  Column already exists, skipping');
      } else throw e;
    }

    // Step 3: Populate khoi_lop from ten_lop
    console.log('\nStep 3: Populating khoi_lop from ten_lop...');
    await prisma.$executeRaw`
      UPDATE lop_hoc 
      SET khoi_lop = CAST(SUBSTRING(ten_lop, 1, 2) AS UNSIGNED)
      WHERE ten_lop REGEXP '^[0-9]{2}' AND khoi_lop IS NULL
    `;
    await prisma.$executeRaw`
      UPDATE lop_hoc 
      SET khoi_lop = CAST(SUBSTRING(ten_lop, 1, 1) AS UNSIGNED)
      WHERE khoi_lop IS NULL AND ten_lop REGEXP '^[0-9]'
    `;
    console.log('✅ khoi_lop populated');

    // Step 4: Make khoi_lop NOT NULL
    console.log('\nStep 4: Making khoi_lop NOT NULL...');
    try {
      await prisma.$executeRaw`ALTER TABLE lop_hoc MODIFY COLUMN khoi_lop INT NOT NULL`;
      console.log('✅ Column constraint updated');
    } catch (e: any) {
      console.log('⚠️  Constraint already set or skipped');
    }

    // Step 5: Create lop_nam table
    console.log('\nStep 5: Creating lop_nam table...');
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE lop_nam (
          id INT NOT NULL AUTO_INCREMENT,
          lop_id INT NOT NULL,
          nam_hoc_id INT NOT NULL,
          gv_chu_nhiem_id INT NULL,
          si_so INT NOT NULL DEFAULT 0,
          PRIMARY KEY (id),
          UNIQUE KEY lop_nam_lop_id_nam_hoc_id_key (lop_id, nam_hoc_id),
          KEY lop_nam_lop_id_idx (lop_id),
          KEY lop_nam_nam_hoc_id_idx (nam_hoc_id),
          KEY lop_nam_gv_chu_nhiem_id_idx (gv_chu_nhiem_id),
          CONSTRAINT lop_nam_lop_id_fkey FOREIGN KEY (lop_id) REFERENCES lop_hoc (id) ON DELETE CASCADE,
          CONSTRAINT lop_nam_nam_hoc_id_fkey FOREIGN KEY (nam_hoc_id) REFERENCES nam_hoc (id) ON DELETE CASCADE,
          CONSTRAINT lop_nam_gv_chu_nhiem_id_fkey FOREIGN KEY (gv_chu_nhiem_id) REFERENCES ho_so_giao_vien (id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✅ Table created');
    } catch (e: any) {
      if (e.message.includes('already exists')) {
        console.log('⚠️  Table already exists, skipping');
      } else throw e;
    }

    // Step 6: Migrate data to lop_nam
    console.log('\nStep 6: Migrating data to lop_nam...');
    const result = await prisma.$executeRaw`
      INSERT IGNORE INTO lop_nam (lop_id, nam_hoc_id, gv_chu_nhiem_id, si_so)
      SELECT 
        id as lop_id,
        nam_hoc_id,
        gv_chu_nhiem_id,
        (SELECT COUNT(*) FROM ho_so_hoc_sinh WHERE lop_id = lop_hoc.id) as si_so
      FROM lop_hoc
      WHERE nam_hoc_id IS NOT NULL
    `;
    console.log(`✅ Migrated ${result} records`);

    // Step 7: Create hoc_sinh_lop_nam table
    console.log('\nStep 7: Creating hoc_sinh_lop_nam table...');
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE hoc_sinh_lop_nam (
          id INT NOT NULL AUTO_INCREMENT,
          hoc_sinh_id INT NOT NULL,
          lop_nam_id INT NOT NULL,
          ngay_vao DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          ngay_ra DATETIME(3) NULL,
          trang_thai ENUM('DANG_HOC', 'BAO_LUU', 'THOI_HOC', 'TOT_NGHIEP', 'CHUYEN_TRUONG') NOT NULL DEFAULT 'DANG_HOC',
          PRIMARY KEY (id),
          UNIQUE KEY hoc_sinh_lop_nam_hoc_sinh_id_lop_nam_id_key (hoc_sinh_id, lop_nam_id),
          KEY hoc_sinh_lop_nam_hoc_sinh_id_idx (hoc_sinh_id),
          KEY hoc_sinh_lop_nam_lop_nam_id_idx (lop_nam_id),
          CONSTRAINT hoc_sinh_lop_nam_hoc_sinh_id_fkey FOREIGN KEY (hoc_sinh_id) REFERENCES ho_so_hoc_sinh (id) ON DELETE CASCADE,
          CONSTRAINT hoc_sinh_lop_nam_lop_nam_id_fkey FOREIGN KEY (lop_nam_id) REFERENCES lop_nam (id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✅ Table created');
    } catch (e: any) {
      if (e.message.includes('already exists')) {
        console.log('⚠️  Table already exists, skipping');
      } else throw e;
    }

    // Step 8: Migrate student assignments
    console.log('\nStep 8: Migrating student assignments...');
    const studentResult = await prisma.$executeRaw`
      INSERT IGNORE INTO hoc_sinh_lop_nam (hoc_sinh_id, lop_nam_id, trang_thai, ngay_vao)
      SELECT 
        hs.id as hoc_sinh_id,
        ln.id as lop_nam_id,
        hs.trang_thai,
        COALESCE(hs.ngay_nhap_hoc, NOW()) as ngay_vao
      FROM ho_so_hoc_sinh hs
      INNER JOIN lop_hoc lh ON hs.lop_id = lh.id
      INNER JOIN lop_nam ln ON ln.lop_id = lh.id AND ln.nam_hoc_id = lh.nam_hoc_id
      WHERE hs.lop_id IS NOT NULL
    `;
    console.log(`✅ Migrated ${studentResult} student assignments`);

    // Step 9: Create lich_hoc_new table
    console.log('\nStep 9: Creating lich_hoc_new table...');
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE lich_hoc_new (
          id INT NOT NULL AUTO_INCREMENT,
          lop_nam_id INT NOT NULL,
          mon_hoc_id INT NOT NULL,
          gv_day_id INT NULL,
          thu INT NOT NULL,
          tiet_bat_dau INT NOT NULL,
          so_tiet INT NOT NULL,
          phong_hoc VARCHAR(50) NULL,
          ngay_tao DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          PRIMARY KEY (id),
          KEY lich_hoc_new_lop_nam_id_idx (lop_nam_id),
          KEY lich_hoc_new_mon_hoc_id_idx (mon_hoc_id),
          KEY lich_hoc_new_gv_day_id_idx (gv_day_id),
          CONSTRAINT lich_hoc_new_lop_nam_id_fkey FOREIGN KEY (lop_nam_id) REFERENCES lop_nam (id) ON DELETE CASCADE,
          CONSTRAINT lich_hoc_new_mon_hoc_id_fkey FOREIGN KEY (mon_hoc_id) REFERENCES mon_hoc (id) ON DELETE CASCADE,
          CONSTRAINT lich_hoc_new_gv_day_id_fkey FOREIGN KEY (gv_day_id) REFERENCES ho_so_giao_vien (id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✅ Table created');
    } catch (e: any) {
      if (e.message.includes('already exists')) {
        console.log('⚠️  Table already exists, skipping');
      } else throw e;
    }

    // Step 10: Migrate schedule data
    console.log('\nStep 10: Migrating schedule data...');
    const scheduleResult = await prisma.$executeRaw`
      INSERT IGNORE INTO lich_hoc_new (lop_nam_id, mon_hoc_id, gv_day_id, thu, tiet_bat_dau, so_tiet, phong_hoc, ngay_tao)
      SELECT 
        ln.id as lop_nam_id,
        lh.mon_hoc_id,
        lh.gv_day_id,
        lh.thu,
        lh.tiet_bat_dau,
        lh.so_tiet,
        lh.phong_hoc,
        lh.ngay_tao
      FROM lich_hoc lh
      INNER JOIN lop_hoc l ON lh.lop_id = l.id
      INNER JOIN lop_nam ln ON ln.lop_id = l.id AND ln.nam_hoc_id = l.nam_hoc_id
      WHERE l.nam_hoc_id IS NOT NULL
    `;
    console.log(`✅ Migrated ${scheduleResult} schedule records`);

    console.log('\n✨ Migration completed successfully!');
    console.log('\n📊 Verification:');

    // Verification queries
    const classCount =
      await prisma.$queryRaw`SELECT COUNT(*) as count FROM lop_hoc`;
    const classYearCount =
      await prisma.$queryRaw`SELECT COUNT(*) as count FROM lop_nam`;
    const studentAssignmentCount =
      await prisma.$queryRaw`SELECT COUNT(*) as count FROM hoc_sinh_lop_nam`;
    const oldScheduleCount =
      await prisma.$queryRaw`SELECT COUNT(*) as count FROM lich_hoc`;
    const newScheduleCount =
      await prisma.$queryRaw`SELECT COUNT(*) as count FROM lich_hoc_new`;

    console.log(`- Classes (LopHoc): ${(classCount as any)[0].count}`);
    console.log(`- Class Years (LopNam): ${(classYearCount as any)[0].count}`);
    console.log(
      `- Student Assignments: ${(studentAssignmentCount as any)[0].count}`,
    );
    console.log(`- Old Schedules: ${(oldScheduleCount as any)[0].count}`);
    console.log(`- New Schedules: ${(newScheduleCount as any)[0].count}`);
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

runMigration()
  .then(() => {
    console.log('\n🎉 All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
