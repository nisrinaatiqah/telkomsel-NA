// src/configs/dns-gi.js
import { findVal, formatExcelDateNumeric } from '../lib/importHelpers';
import { getRegionFromCity } from '../lib/cityMapper';

export const dnsGiConfig = {
  title: 'DNS Gi',
  prismaModel: 'dNS_Gi',
  columns: [
    { label: 'Name', key: 'name' },
    { label: 'Existing HW Type', key: 'hw_type' },
    { label: 'Storage', key: 'storage' },
    { label: 'Existing SW version VNF', key: 'sw_vnf' },
    { label: 'Existing SW version VIM', key: 'sw_vim' },
    { label: 'Capacity - Existing(K QpS)', key: 'capacity_kqps' },
    { label: 'HW EOM', key: 'hw_eom' },
    { label: 'HW EOS', key: 'hw_eos' },
  ],
  // Hapus parameter 'mem' karena Modal tidak mengirimkannya lagi
  mapExcel: (row, idx) => {
    const name = String(findVal(row, 'NAME') || findVal(row, 'NENAME') || "");
    
    // Ambil EOS langsung. Jika data Excel Anda berantakan (banyak #N/A), 
    // pastikan di Excel sudah dibersihkan dulu atau gunakan findVal yang agresif.
    const rawEos = findVal(row, 'HWEOS') || findVal(row, 'EOS');

    return {
      // Tambahkan Date.now() agar siteIdCode selalu UNIK dan tidak ditolak Database
      siteIdCode: String(findVal(row, 'NEID') || `GI-${idx}-${Date.now()}`),
      
      name: name,
      // Pastikan Region terisi (Wajib di Prisma), jika tidak ketemu mapping, beri 'Unknown'
      region: getRegionFromCity(name) || "Other", 
      city: "N/A", 
      status: "Active",
      
      hw_type: String(findVal(row, 'HWTYPE') || findVal(row, 'HWTYPEEXISTING') || "-"),
      storage: String(findVal(row, 'STORAGE') || "-"),
      sw_vnf: String(findVal(row, 'VNF') || findVal(row, 'SWVNF') || "-"),
      sw_vim: String(findVal(row, 'VIM') || findVal(row, 'SWVIM') || "-"),
      capacity_kqps: String(findVal(row, 'KQPS') || findVal(row, 'CAPACITY') || "-"),
      
      hw_eom: formatExcelDateNumeric(findVal(row, 'HWEOM')),
      hw_eos: formatExcelDateNumeric(rawEos)
    };
  }
};