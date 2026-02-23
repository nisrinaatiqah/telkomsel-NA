// src/configs/tmgw.js
import { findVal, getRegionFromCity } from '../lib/importHelpers';

export const tmgwConfig = {
  title: 'TMGW',
  prismaModel: 'tMGW', // Pastikan model ini sudah ada di schema.prisma Anda
  
  // 1. Konfigurasi Kolom untuk Tabel Dashboard
  columns: [
    { label: 'REGIONAL', key: 'regional_internal' },
    { label: 'TMGW ELEMENT', key: 'name' },
    { label: 'VENDOR', key: 'vendor' },
    { label: 'SCC CAPACITY', key: 'scc_capacity' },
    { label: 'SCC USAGE', key: 'scc_usage' },
    { label: 'SCC UTIL (%)', key: 'scc_util' },
    { label: 'OCC CATEGORY', key: 'occ_category' }
  ],

  // 2. Logika Mapping Excel
  mapExcel: (row, idx, mem) => {
    // A. Ambil nilai TMGW Element (Contoh: ZBNA1, ZMDN2)
    const elementRaw = findVal(row, 'TMGW ELEMENT') || findVal(row, 'NAME') || "";
    const name = String(elementRaw).trim();

    // B. Logika Merged Cells untuk Regional (Sumbagut, Sumbagteng, dll)
    const regionalRaw = findVal(row, 'REGIONAL') || "";
    if (regionalRaw && String(regionalRaw).trim() !== "") {
      mem.currentMssReg = String(regionalRaw).trim();
    }

    // Filter baris kosong atau baris judul
    if (!name || name.toUpperCase().includes('TMGW DATA')) return null;

    // C. Logika Klasifikasi Daerah untuk Peta
    // getRegionFromCity akan otomatis mendeteksi kode BNA, MDN, PKB di dalam nama ZBNA1, ZMDN2
    let region = getRegionFromCity(name);
    
    // Fallback: Jika kode di nama tidak terdaftar, tebak berdasarkan teks Regional
    if (region === 'UNKNOWN') {
      const regTxt = (mem.currentMssReg || "").toUpperCase();
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
      else if (regTxt.includes('PUMA')) region = 'PAPUA';
      else region = 'UNKNOWN';
    }

    // D. Return Object Final (Sesuaikan Case dengan Database)
    return {
      siteIdCode: `${name}-${idx}-${Date.now()}`, 
      name: name,
      region: region,   
      regional_internal: String(mem.currentMssReg || "-"), // Untuk kolom Regional di tabel
      status: "Active",
      vendor: String(findVal(row, 'VENDOR') || "-"),
      scc_capacity: String(findVal(row, 'SCC CAPACITY') || "-"),
      scc_usage: String(findVal(row, 'SCC USAGE') || "-"),
      scc_util: String(findVal(row, 'SCC UTIL') || "-"),
      occ_category: String(findVal(row, 'OCC CATEGORY') || "-"),
    };
  }
};