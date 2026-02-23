const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Memulai Pengisian Data (Seeding) ---');

  // Hapus data lama agar tidak duplikat (Opsional)
  await prisma.site.deleteMany({});

  const regions = ['Sumatera', 'Jakarta', 'Jawa Barat', 'Jawa Tengah', 'Jawa Timur', 'Kalimantan', 'Sulawesi', 'Bali', 'Papua'];
  const elements = ['MSS', 'MGW', 'SGSN-MME', 'GGSN', 'DNS Gi', 'DNS Gn', 'ADC', 'USC/STP'];

  for (const reg of regions) {
    for (const ele of elements) {
      // Buat 2-3 site contoh per daerah per elemen
      for (let i = 1; i <= 2; i++) {
        await prisma.site.create({
          data: {
            siteIdCode: `${ele}-${reg.substring(0, 3).toUpperCase()}-00${i}`,
            name: `${ele} ${reg} Site ${i}`,
            elementType: ele,
            region: reg,
            status: Math.random() > 0.2 ? 'Active' : 'Maintenance',
            uptime: parseFloat((97 + Math.random() * 2.9).toFixed(2)),
            // Data teknis berbeda tergantung elemen
            technicalData: ele === 'MSS' ? 
              { vlr_capacity: "500k", signaling_load: "40%" } : 
              { throughput: "20Gbps", pdp_context: "1.2M" }
          }
        });
      }
    }
  }

  console.log('--- Seeding Selesai! Data berhasil masuk ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });