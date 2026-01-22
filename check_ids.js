const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const users = await prisma.nguoiDung.findMany({
        where: { vaiTro: 'GIAO_VIEN' },
        include: { hoSoGiaoVien: true }
    });
    console.log('Teachers with profiles:');
    users.forEach(u => {
        console.log(`User ID: ${u.id}, Name: ${u.hoTen}, Profile ID: ${u.hoSoGiaoVien?.id}`);
    });
    process.exit(0);
}

check();
