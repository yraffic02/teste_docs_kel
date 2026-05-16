const XLSX = require("xlsx");
const fs = require("fs/promises");

function parseImport(filePath) {
  const wb = XLSX.readFile(filePath);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
  return rows;
}

function generateReport(data, sheetName = "Relatorio") {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  return buffer;
}

module.exports = { parseImport, generateReport };
