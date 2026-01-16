import { PrismaClient, VaiTro } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding standardized data...');

    // 1. Create Admin User
    const admin = await prisma.nguoiDung.upsert({
        where: { taiKhoan: 'admin' },
        update: {},
        create: {
            taiKhoan: 'admin',
            matKhau: 'admin123', // In a real app, use hashed passwords
            email: 'admin@nguyenhue.school',
            vaiTro: VaiTro.ADMIN,
        },
    });
    console.log('Created Admin user:', admin.taiKhoan);

    // 2. Create Staff User
    const staff = await prisma.nguoiDung.upsert({
        where: { taiKhoan: 'staff' },
        update: {},
        create: {
            taiKhoan: 'staff',
            matKhau: 'staff123',
            email: 'staff@nguyenhue.school',
            vaiTro: VaiTro.NHAN_VIEN,
            hoSoNhanVien: {
                create: {
                    maSo: 'NV001',
                    hoTen: 'Nguyễn Văn Nhân Viên',
                }
            }
        },
    });
    console.log('Created Staff user:', staff.taiKhoan);

    // 3. Initial Academic Data
    const namHoc = await prisma.namHoc.create({
        data: { tenNamHoc: '2025-2026' },
    });
    console.log('Created Academic Year:', namHoc.tenNamHoc);

    const monHoc = await prisma.monHoc.createMany({
        data: [
            { tenMon: 'Toán học' },
            { tenMon: 'Văn học' },
            { tenMon: 'Tiếng Anh' },
            { tenMon: 'Vật lý' },
            { tenMon: 'Hóa học' },
        ],
    });
    console.log('Created Subjects');

    const khois = await prisma.khoi.createMany({
        data: [
            { tenKhoi: 'Khối 10', maKhoi: 10 },
            { tenKhoi: 'Khối 11', maKhoi: 11 },
            { tenKhoi: 'Khối 12', maKhoi: 12 },
        ],
    });
    console.log('Created Grades');

    console.log('Seed completed successfully! 🚀');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
