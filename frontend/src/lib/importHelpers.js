// src/lib/importHelpers.js
import { getRegionFromCity } from './cityMapper';
export { getRegionFromCity };

export const formatExcelDateNumeric = (val) => {
  if (val === null || val === undefined || val === "" || val === "-") return "-";
  const strVal = String(val).trim();
  if (strVal.includes('#N/A') || strVal.toLowerCase() === 'ny' || strVal.toLowerCase() === 'none') return strVal;

  const numVal = Number(val);
  // Jika angka serial Excel (misal 45657)
  if (!isNaN(numVal) && numVal > 30000) {
    const date = new Date(Math.round((numVal - 25569) * 86400 * 1000));
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  }
  return strVal; // Kembalikan string asli jika bukan angka serial
};

export const findVal = (row, target) => {
  if (!row) return null;
  const keys = Object.keys(row);
  
  // Bersihkan target (Misal: "SW EOFS" -> "SWEOFS")
  const cleanTarget = target.trim().replace(/[^A-Z0-9]/gi, '').toUpperCase();

  // PRIORITAS 1: Cari yang namanya PERSIS sama (Exact Match)
  // Ini kunci agar SW EOS tidak tertukar dengan SW EOFS
  const exactMatch = keys.find(k => {
    const cleanKey = k.trim().replace(/[^A-Z0-9]/gi, '').toUpperCase();
    return cleanKey === cleanTarget;
  });
  if (exactMatch !== undefined) return row[exactMatch];

  // PRIORITAS 2: Cari yang mengandung kata tersebut (Fuzzy Match)
  const partialMatch = keys.find(k => {
    const cleanKey = k.trim().replace(/[^A-Z0-9]/gi, '').toUpperCase();
    return cleanKey.includes(cleanTarget);
  });
  
  return (partialMatch !== undefined) ? row[partialMatch] : null;
};

export const getValByIndex = (row, keyword, index) => {
  const keys = Object.keys(row);
  const matches = keys.filter(k => k.trim().toUpperCase().includes(keyword.toUpperCase()));
  const targetKey = matches[index];
  return (targetKey !== undefined) ? String(row[targetKey]).trim() : "-";
};