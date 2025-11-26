// Utility to format numbers as Sri Lankan Rupees (LKR)
export function formatToLKR(amount) {
  if (isNaN(amount)) return 'LKR 0';
  return 'LKR ' + Number(amount).toLocaleString('en-LK', { minimumFractionDigits: 2 });
}
export const formatToLKRShort = (number) => {
  if (number === null || number === undefined || isNaN(number)) {
    return "N/A";
  }
  if (number >= 1_000_000_000) {
    return `LKR ${(number / 1_000_000_000).toFixed(2)} B`;
  }
  if (number >= 1_000_000) {
    return `LKR ${(number / 1_000_000).toFixed(2)} M`;
  }
  if (number >= 1_000) {
     return `LKR ${(number / 1_000).toFixed(1)} K`;
  }
  return `LKR ${number}`;
};