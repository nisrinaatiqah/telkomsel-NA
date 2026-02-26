// src/configs/udm-volte.js
import { findVal, getRegionFromCity } from '../lib/importHelpers';

export const udmVolteConfig = {
  title: 'UDM VoLTE',
  prismaModel: 'UDM-VoLTE',
  columns: [
    { label: 'AREA', key: 'area' },
    { label: 'NE ID', key: 'name' },
    { label: 'BE CAPACITY', key: 'be_capacity' },
    { label: 'BE USAGE', key: 'be_usage' },
    { label: 'BE OCC [%]', key: 'be_occupancy' },
    { label: 'FE CAPACITY', key: 'fe_capacity' },
    { label: 'FE USAGE', key: 'fe_usage' },
    { label: 'FE OCC [%]', key: 'fe_occupancy' },
  ],
  mapExcel: (row, idx) => {
    const name = String(findVal(row, 'NE ID') || "").trim();
    if (!name || name === "" || name.toUpperCase().includes('TOTAL')) return null;

    const p = (key) => {
        let v = findVal(row, key) || "0";
        let n = parseFloat(String(v).replace(',', '.'));
        if (n > 0 && n < 1 && !String(v).includes('.')) n = n * 100;
        return isNaN(n) ? "0" : n.toString();
    };

    const cityCode = name.split('-')[2]?.replace(/\d+$/, '').toUpperCase() || "";

    return {
      siteIdCode: `${name}-VoLTE-${idx}-${Date.now()}`,
      area: String(findVal(row, 'Area') || "-"),
      name: name,
      region: getRegionFromCity(cityCode) || "UNKNOWN",
      be_capacity: String(findVal(row, 'BE Capacity') || "0").replace(/\./g, ''),
      be_usage: String(findVal(row, 'BE Usage') || "0").replace(/\./g, ''),
      be_occupancy: p('BE Occ'),
      fe_capacity: String(findVal(row, 'FE Capacity') || "0").replace(/\./g, ''),
      fe_usage: String(findVal(row, 'FE Usage') || "0").replace(/\./g, ''),
      fe_occupancy: p('FE Occ')
    };
  }
};