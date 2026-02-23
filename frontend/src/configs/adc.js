import { findVal, getRegionFromCity } from '../lib/importHelpers';

export const adcConfig = {
  title: 'ADC',
  prismaModel: 'aDC',
  columns: [
    { label: 'Node', key: 'name' },
    { label: 'VLAN', key: 'vlan' },
    { label: 'VRF SDN', key: 'vrf_sdn' },
  ],
  mapExcel: (row, idx) => {
    const node = String(findVal(row, 'NODE') || findVal(row, 'NAME') || "");
    const codeMatch = node.match(/^[A-Z]+/i);

    // --- VALUE SCANNER: Mencari data di seluruh isi baris ---
    const allValues = Object.values(row).map(v => String(v).trim());
    
    // Cari VLAN: Ambil baris yang isinya HANYA ANGKA dan panjangnya 2-5 digit
    const vlan = allValues.find(v => /^\d+$/.test(v) && v.length >= 2 && v.length <= 5) || "-";
    
    // Cari VRF: Ambil baris yang mengandung kata kunci teknis VRF
    const vrf = allValues.find(v => 
      v.toUpperCase().includes('OAM') || 
      v.toUpperCase().includes('INTERNET') || 
      v.toUpperCase().includes('SDN') ||
      v.toUpperCase().includes('VRF')
    ) || "-";

    return {
      siteIdCode: `${node}-${vlan}-${idx}`,
      name: node, 
      region: getRegionFromCity(codeMatch ? codeMatch[0] : ""), 
      city: "N/A", 
      status: "Active",
      vlan: vlan,
      vrf_sdn: vrf
    };
  }
};