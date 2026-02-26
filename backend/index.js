const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// 1. DAFTAR MODEL (Disesuaikan agar sinkron dengan Frontend & Prisma)
const modelMap = {
    'DNS Gn': prisma.dNS_Gn,
    'DNS Gi': prisma.dNS_Gi,
    'ADC': prisma.aDC, 
    'USC/STP': prisma.uSC_STP,
    'UDM/HSS': prisma.uDM_HSS,
    'MSS': prisma.mSS,
    'GGSN': prisma.gGSN,
    'SGSN-MME': prisma.sGSN_MME,
    'IMS': prisma.iMS,
    'TMGW': prisma.tMGW,
    'MGW': prisma.mGW,
    'GSS': prisma.gSS,
    'GGSN-THP': prisma.gGSN_THP, 
    'GGSN/THP': prisma.gGSN_THP,
    'GGSN THP': prisma.gGSN_THP,
    'GGSN-PDP': prisma.gGSN_PDP,
    'GGSN/PDP': prisma.gGSN_PDP,
    'GGSN PDP': prisma.gGSN_PDP,
    'SGSN-MME': prisma.sGSN_MME,
    'SGSN/MME': prisma.sGSN_MME,
    'SGSN MME': prisma.sGSN_MME,
    'UDM-5G': prisma.uDM_5G,
    'UDM/5G': prisma.uDM_5G,
    'UDM 5G': prisma.uDM_5G,
    'UDM-VoLTE': prisma.uDM_VoLTE,
    'UDM/VoLTE': prisma.uDM_VoLTE,
    'UDM VoLTE': prisma.uDM_VoLTE
};

const regionalToProvinces = {
    "Regional Sumbagut": ["ACEH", "SUMATERA UTARA"],
    "Regional Sumbagteng": ["RIAU", "KEPULAUAN RIAU", "SUMATERA BARAT"],
    "Regional Sumbagsel": ["SUMATERA SELATAN", "LAMPUNG", "JAMBI", "BENGKULU", "KEPULAUAN BANGKA BELITUNG"],
    "Regional Jabotabek": ["DKI JAKARTA", "BANTEN"],
    "Regional Jawa Barat": ["JAWA BARAT"],
    "Regional Jawa Tengah & DIY": ["JAWA TENGAH", "DAERAH ISTIMEWA YOGYAKARTA"],
    "Regional Jawa Timur": ["JAWA TIMUR"],
    "Regional Bali Nusra": ["BALI", "NUSA TENGGARA BARAT", "NUSA TENGGARA TIMUR"],
    "Regional Kalimantan": ["KALIMANTAN BARAT", "KALIMANTAN TENGAH", "KALIMANTAN SELATAN", "KALIMANTAN TIMUR", "KALIMANTAN UTARA"],
    "Regional Sulawesi": ["SULAWESI SELATAN", "SULAWESI BARAT", "SULAWESI TENGGARA", "SULAWESI TENGAH", "SULAWESI UTARA", "GORONTALO"],
    "Regional Papua & Maluku": ["MALUKU", "MALUKU UTARA", "PAPUA", "PAPUA BARAT", "PAPUA TENGAH", "PAPUA SELATAN", "PAPUA PEGUNUNGAN", "PAPUA BARAT DAYA"]
};

// --- RUTE API ---

// A. Ambil Log Aktivitas
app.get('/api/history', async (req, res) => {
    try {
        const logs = await prisma.activityLog.findMany({ 
            orderBy: { timestamp: 'desc' }, 
            take: 20 
        });
        res.json(logs);
    } catch (e) { 
        res.json([]); 
    }
});

// B. Import Data (Batch)
app.post('/api/sites/batch', async (req, res) => {
    const { sites, elementType } = req.body;
    const normalizedElement = elementType ? elementType.replace('-', '/') : "";
    const model = modelMap[normalizedElement];

    if (!model) return res.status(400).json({ error: `Tabel ${normalizedElement} tidak ditemukan.` });

    try {
        console.log(`📦 Memproses import ${sites.length} data ke: ${normalizedElement}`);
        const result = await model.createMany({ data: sites, skipDuplicates: true });
        
        await prisma.activityLog.create({
            data: {
                userName: "Admin", action: "Batch Import",
                element: normalizedElement,
                details: `Berhasil mengimport ${result.count} data.`
            }
        }).catch(() => {});

        res.json({ message: "Sukses", count: result.count });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// C. PERBAIKAN: Rute ambil SEMUA data per elemen (Untuk MAPVIEW/HEATMAP)
// Inilah rute yang tadi menyebabkan Error 404 karena belum ada
app.get('/api/sites/:element', async (req, res) => {
    const { element } = req.params;
    const normalizedElement = element.replace('-', '/');
    const model = modelMap[normalizedElement];

    if (!model) return res.status(404).json({ error: `Model ${normalizedElement} tidak ditemukan` });

    try {
        const data = await model.findMany();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// D. Ambil data per elemen DAN per wilayah (Untuk DETAIL TABLE)
app.get('/api/sites/:element/:region', async (req, res) => {
    const normalizedElement = req.params.element.replace('-', '/');
    const model = modelMap[normalizedElement];
    if(!model) return res.json([]);
    
    try {
        const data = await model.findMany({ 
            where: { region: { equals: req.params.region.trim(), mode: 'insensitive' }}
        });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// E. Summary API (Untuk Card Summary di Dashboard)
app.get('/api/summary/:element', async (req, res) => {
    const { element } = req.params;
    const normalizedElement = element.replace('-', '/');
    const model = modelMap[normalizedElement];

    if (!model) return res.status(404).json({ error: "Model tidak ditemukan" });

    try {
        const data = await model.findMany();
        const clean = (v) => parseFloat(String(v || '0').replace(/\./g, '').replace(/,/g, '.')) || 0;

        let totalCap = 0;
        let totalUsage = 0;

        if (normalizedElement === 'MSS') {
            totalCap = data.reduce((acc, curr) => acc + clean(curr.sub_capacity), 0);
            totalUsage = data.reduce((acc, curr) => acc + clean(curr.sub_usage), 0);
        } else if (normalizedElement === 'MGW' || normalizedElement === 'TMGW') {
            totalCap = data.reduce((acc, curr) => acc + clean(curr.scc_capacity), 0);
            totalUsage = data.reduce((acc, curr) => acc + clean(curr.scc_usage), 0);
        }

        const avgUtil = totalCap > 0 ? ((totalUsage / totalCap) * 100).toFixed(2) : 0;

        res.json({
            totalCapacity: totalCap,
            totalUsage: totalUsage,
            averageUtilization: avgUtil,
            totalUnits: data.length
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/sites/regional/:element/:regionalName', async (req, res) => {
    const { element, regionalName } = req.params;
    const normalizedElement = element.replace('-', '/');
    const model = modelMap[normalizedElement];
    
    if (!model) return res.status(404).json({ error: "Model tidak ditemukan" });

    // Cari daftar provinsi berdasarkan nama regional yang dikirim
    const provinces = regionalToProvinces[regionalName];

    if (!provinces) {
        return res.status(400).json({ error: "Nama Regional tidak valid" });
    }

    try {
        const data = await model.findMany({
            where: {
                region: {
                    in: provinces, // Mencari data yang provinsinya ada di dalam list regional tersebut
                    mode: 'insensitive'
                }
            }
        });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = 5001;
app.listen(PORT, () => console.log(`🚀 Backend Ready on Port ${PORT}`));