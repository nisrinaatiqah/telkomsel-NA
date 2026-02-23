// src/configs/gss.js
import { findVal, getRegionFromCity } from '../lib/importHelpers';

export const gssConfig = {
  title: 'GSS',
  prismaModel: 'gSS', 
  columns: [
    { label: 'REGIONAL', key: 'regional_internal' },
    { label: 'GSS ELEMENT', key: 'name' },
    { label: 'VENDOR', key: 'vendor' },
    { label: 'BHCA CAPACITY', key: 'bhca_capacity' },
    { label: 'BHCA USAGE', key: 'bhca_usage' },
    { label: 'BHCA OCC (%)', key: 'bhca_occupancy' },
    { label: 'CPU LOAD (%)', key: 'cpu_load' },
  ],

  mapExcel: (row, idx, mem) => {
    const elementRaw = findVal(row, 'GSS ELEMENT') || findVal(row, 'NAME') || "";
    const name = String(elementRaw).trim();

    const regionalRaw = findVal(row, 'REGIONAL') || "";
    if (regionalRaw && String(regionalRaw).trim() !== "") {
      mem.currentMssReg = String(regionalRaw).trim();
    }

    if (!name || name.toUpperCase().includes('GSS DATA')) return null;

    // --- LOGIKA PENENTUAN PROVINSI UNTUK PETA ---
    let region = getRegionFromCity(name); // Coba deteksi dari kode nama (MDN, dsb)

    if (region === 'UNKNOWN' || !region) {
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
      else if (regTxt.includes('PUMA')) region = 'PAPUA';
    }

    return {
      siteIdCode: `${name}-${idx}-${Date.now()}`, 
      name: name,
      region: region,   
      regional_internal: String(mem.currentMssReg || "-"),
      status: "Active",
      vendor: String(findVal(row, 'VENDOR') || "-"),
      bhca_capacity: String(findVal(row, 'BHCA GSS CAPACITY') || "-"),
      bhca_usage: String(findVal(row, 'BHCA GSS USAGE') || "-"),
      bhca_occupancy: String(findVal(row, 'BHCA GSS OCCUPANCY') || findVal(row, 'OCCUPANCY') || "0"),
      cpu_load: String(findVal(row, 'CPU LOAD') || "0"),
      bhca_category: String(findVal(row, 'BHCA OCC CATEGORY') || "-"),
      cpu_category: String(findVal(row, 'CPU LOAD CATEGORY') || "-"),
    };
  }
};