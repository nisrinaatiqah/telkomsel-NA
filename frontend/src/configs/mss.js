// src/configs/mss.js
import { findVal, getRegionFromCity } from '../lib/importHelpers';

export const mssConfig = {
  title: 'MSS',
  prismaModel: 'mSS',
  // 1. Tambahkan di sini agar muncul di Tabel Dashboard
  columns: [
    { label: 'REGIONAL', key: 'regional_internal' }, 
    { label: 'MSS ELEMENT', key: 'name' },
    { label: 'VENDOR', key: 'vendor' },
    { label: 'SUB CAPACITY', key: 'sub_capacity' },
    { label: 'SUB USAGE', key: 'sub_usage' },
    { label: 'OCC (%)', key: 'sub_occupancy' },
    { label: 'CPU LOAD (%)', key: 'cpu_load' },
    { label: 'VLR CATEGORY', key: 'vlr_category' },
    { label: 'CPU CATEGORY', key: 'cpu_category' }, // <-- TAMBAHKAN INI
  ],

  mapExcel: (row, idx, mem) => {
    const mssElementRaw = findVal(row, 'MSS ELEMENT') || findVal(row, 'NAME') || "";
    const name = String(mssElementRaw).trim();

    const regionalRaw = findVal(row, 'REGIONAL') || findVal(row, 'REGION') || "";
    if (regionalRaw && String(regionalRaw).trim() !== "") {
      mem.currentMssReg = String(regionalRaw).trim();
    }

    let region = getRegionFromCity(name);
    if (region === 'UNKNOWN') {
      // Penebak Cadangan berdasarkan kolom Regional di Excel
      const regTxt = mem.currentMssReg.toUpperCase();
      if (regTxt.includes('SUMBAGUT')) region = 'SUMATERA UTARA';
      else if (regTxt.includes('SUMBAGTENG')) region = 'RIAU';
      else if (regTxt.includes('SUMBAGSEL')) region = 'SUMATERA SELATAN';
      else if (regTxt.includes('JABOTABEK')) region = 'DKI JAKARTA';
      else if (regTxt.includes('WEST JAVA')) region = 'JAWA BARAT';
      else if (regTxt.includes('CENTRAL JAVA')) region = 'JAWA TENGAH';
      else if (regTxt.includes('EAST JAVA')) region = 'JAWA TIMUR';
      else if (regTxt.includes('BALINUSRA')) region = 'BALI';
      else if (regTxt.includes('KALIMANTAN')) region = 'KALIMANTAN TIMUR';
      else if (regTxt.includes('SULAWESI')) region = 'SULAWESI SELATAN';
      else if (regTxt.includes('PUMA') || regTxt.includes('PAPUA')) region = 'PAPUA';
    }

    return {
      siteIdCode: `${name}-${idx}-${Date.now()}`, 
      name: name,
      region: region,   
      regional_internal: String(mem.currentMssReg || "-"),
      status: "Active",
      vendor: String(findVal(row, 'VENDOR') || "-"),
      sub_capacity: String(findVal(row, 'SUBSCRIBERCAPACITY') || findVal(row, 'CAPACITY') || "-"),
      sub_usage: String(findVal(row, 'SUBSCRIBERUSAGE') || findVal(row, 'USAGE') || "-"),
      sub_occupancy: String(findVal(row, 'SUBSCRIBEROCCUPANCY') || findVal(row, 'OCCUPANCY') || "-"),
      cpu_load: String(findVal(row, 'CPU') || findVal(row, 'CPUMSS') || "-"),
      vlr_category: String(findVal(row, 'VLR') || findVal(row, 'VLROCC') || "-"),
      
      // --- TAMBAHKAN INI UNTUK MENGAMBIL DATA DARI EXCEL ---
      cpu_category: String(findVal(row, 'CPULOADCATEGORY') || findVal(row, 'CPUCATEGORY') || "-"),
    };
  }
};