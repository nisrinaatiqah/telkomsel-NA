// src/configs/sgsn.js
import { findVal, getRegionFromCity } from '../lib/importHelpers';

export const sgsnConfig = {
  title: 'SGSN-MME',
  prismaModel: 'sGSN_MME', 
  columns: [
    { label: 'VENDOR', key: 'vendor' },
    { label: 'AREA', key: 'department' },
    { label: 'REGIONAL', key: 'regional_internal' },
    { label: 'SGSN NAME', key: 'name' },
    { label: 'CAPACITY', key: 'sub_capacity' },
    { label: 'USAGE', key: 'sub_usage' },
    { label: 'OCC [%]', key: 'sub_occupancy' },
  ],

  mapExcel: (row, idx, mem) => {
    const name = String(findVal(row, 'SGSN NAME') || findVal(row, 'NAME') || "");
    const regionalExcel = String(findVal(row, 'REGIONAL') || "");

    // --- LOGIKA EKSTRAK DAERAH DARI NAMA ---
    // AMFBRN2 -> Hilangkan angka di belakang -> AMFBRN -> Ambil 3 huruf terakhir -> BRN
    // vMMEBDL1 -> Hilangkan angka di belakang -> vMMEBDL -> Ambil 3 huruf terakhir -> BDL
    const cleanName = name.replace(/\d+$/, ''); 
    const cityCode = cleanName.substring(cleanName.length - 3).toUpperCase();

    let region = getRegionFromCity(cityCode);

    // Fallback jika citymapper gagal (pakai regional excel)
    if (!region || region === 'UNKNOWN') {
      const regTxt = regionalExcel.toUpperCase();
      if (regTxt.includes('JABO')) region = 'DKI JAKARTA';
      else if (regTxt.includes('WEST JAVA')) region = 'JAWA BARAT';
      else if (regTxt.includes('EAST JAVA')) region = 'JAWA TIMUR';
      else if (regTxt.includes('SUMBAGUT')) region = 'SUMATERA UTARA';
      else if (regTxt.includes('SUMBAGTENG')) region = 'RIAU';
      else if (regTxt.includes('SUMBAGSEL')) region = 'SUMATERA SELATAN';
      else if (regTxt.includes('CENTRAL JAVA')) region = 'JAWA TENGAH';
      else if (regTxt.includes('BALINUSRA')) region = 'BALI';
      else if (regTxt.includes('KALIMANTAN')) region = 'KALIMANTAN TIMUR';
      else if (regTxt.includes('SULAWESI')) region = 'SULAWESI SELATAN';
      else if (regTxt.includes('PUMA')) region = 'PAPUA';
    }

    return {
      siteIdCode: `${name}-${idx}-${Date.now()}`,
      name: name,
      region: region || "UNKNOWN",
      city: cityCode, 
      status: "Active",
      vendor: String(findVal(row, 'VENDOR') || "-"),
      regional_internal: regionalExcel || "-",
      department: String(findVal(row, 'AREA') || "-"),
      sub_capacity: String(findVal(row, 'CAPACITY') || "0"),
      sub_usage: String(findVal(row, 'USAGE') || "0"),
      sub_occupancy: String(findVal(row, 'Occ') || "0"), // Akan diproses di UI
    };
  }
};