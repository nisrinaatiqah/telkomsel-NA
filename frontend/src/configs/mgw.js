// src/configs/mgw.js
import { findVal, getRegionFromCity } from '../lib/importHelpers';

export const mgwConfig = {
  title: 'MGW',
  prismaModel: 'mGW', 
  columns: [
    { label: 'REGIONAL', key: 'regional_internal' },
    { label: 'MGW ELEMENT', key: 'name' },
    { label: 'VENDOR', key: 'vendor' },
    { label: 'SCC CAPACITY', key: 'scc_capacity' },
    { label: 'SCC USAGE', key: 'scc_usage' },
    { label: 'SCC UTIL (%)', key: 'scc_util' },
    { label: 'OCC CATEGORY', key: 'occ_category' }
  ],

  mapExcel: (row, idx, mem) => {
    const elementRaw = findVal(row, 'MGW ELEMENT') || findVal(row, 'NAME') || "";
    const name = String(elementRaw).trim();

    const regionalRaw = findVal(row, 'REGIONAL') || "";
    if (regionalRaw && String(regionalRaw).trim() !== "") {
      mem.currentMssReg = String(regionalRaw).trim();
    }

    if (!name || name.toUpperCase().includes('MGW DATA')) return null;

    // --- LOGIKA KLASIFIKASI DAERAH UNTUK PETA (PROVINSI) ---
    let province = getRegionFromCity(name); 

    if (province === 'UNKNOWN' || !province) {
      const regTxt = (mem.currentMssReg || "").toUpperCase();
      if (regTxt.includes('SUMBAGUT')) province = 'SUMATERA UTARA';
      else if (regTxt.includes('SUMBAGTENG')) province = 'RIAU';
      else if (regTxt.includes('SUMBAGSEL')) province = 'SUMATERA SELATAN';
      else if (regTxt.includes('JABOTABEK')) province = 'DKI JAKARTA';
      else if (regTxt.includes('WEST JAVA')) province = 'JAWA BARAT';
      else if (regTxt.includes('CENTRAL JAVA')) province = 'JAWA TENGAH';
      else if (regTxt.includes('EAST JAVA')) province = 'JAWA TIMUR';
      else if (regTxt.includes('BALINUSRA')) province = 'BALI';
      else if (regTxt.includes('KALIMANTAN')) province = 'KALIMANTAN TIMUR';
      else if (regTxt.includes('SULAWESI')) province = 'SULAWESI SELATAN';
      else if (regTxt.includes('PUMA')) province = 'PAPUA';
      else province = 'UNKNOWN';
    }

    return {
      siteIdCode: `${name}-${idx}-${Date.now()}`, 
      name: name,
      region: province, // Bridge ke Peta
      regional_internal: String(mem.currentMssReg || "-"), // Bridge ke Summary
      status: "Active",
      vendor: String(findVal(row, 'VENDOR') || "-"),
      scc_capacity: String(findVal(row, 'SCC CAPACITY') || "-"),
      scc_usage: String(findVal(row, 'SCC USAGE') || "-"),
      scc_util: String(findVal(row, 'SCC UTIL') || "0"),
      occ_category: String(findVal(row, 'OCC CATEGORY') || "-"),
    };
  }
};