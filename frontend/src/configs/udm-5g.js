// src/configs/udm-5g.js
import { findVal, getRegionFromCity } from '../lib/importHelpers';

export const udm5gConfig = {
  title: 'UDM 5G',
  prismaModel: 'UDM-5G',
  columns: [
    { label: 'AREA', key: 'area' },
    { label: 'NE ID', key: 'name' },
    { label: '5G BE CAPACITY', key: 'capacity' },
    { label: '5G BE USAGE', key: 'usage' },
    { label: '5G BE OCC [%]', key: 'occupancy' },
  ],
  mapExcel: (row, idx) => {
    // Cari Nama (NE ID)
    const name = String(findVal(row, 'NE ID') || findVal(row, 'NAME') || "").trim();
    if (!name || name === "" || name.toUpperCase().includes('TOTAL')) return null;

    // Helper p untuk ambil data persen secara REAL tanpa pembulatan
    const p = (key) => {
      let v = findVal(row, key) || "0";
      let n = parseFloat(String(v).replace(',', '.'));
      if (n > 0 && n < 1 && !String(v).includes('.')) n = n * 100;
      return isNaN(n) ? "0" : n.toString(); // Kirim real string tanpa toFixed
    };

    // Ekstrak kode daerah (HLR-BE-MDN1 -> MDN)
    const cityCode = name.split('-')[2]?.replace(/\d+$/, '').toUpperCase() || "";

    return {
      siteIdCode: `${name}-5G-${idx}-${Date.now()}`,
      area: String(findVal(row, 'Area') || "-"),
      name: name,
      region: getRegionFromCity(cityCode) || "UNKNOWN",
      capacity: String(findVal(row, 'Capacity') || "0").replace(/\./g, ''),
      usage: String(findVal(row, 'Usage') || "0").replace(/\./g, ''),
      occupancy: p('Occ') // Panggil fungsi p di sini
    };
  }
};