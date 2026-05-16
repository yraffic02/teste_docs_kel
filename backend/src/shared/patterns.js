const CPF_REGEX = /\b(\d{3}\.?\d{3}\.?\d{3}-?\d{2})\b/g;
const CNPJ_REGEX = /\b(\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2})\b/g;
const CURRENCY_REGEX = /(?:R\$|USD|EUR)\s*(\d{1,3}(?:\.\d{3})*(?:,\d{2})?|\d+(?:\.\d{2})?)/g;
const DATE_REGEX = /\b(\d{2}[/-]\d{2}[/-]\d{2,4}|\d{4}[/-]\d{2}[/-]\d{2})\b/g;
const DOC_NUMBER_REGEX = /\b((?:\d{1,2}\.\d{3}\.\d{3}-[\dxX])|[A-Z]{2}\d{6,8})\b/g;

const STOP_WORDS = "nome|cliente|cpf|cnpj|data|telefone|endereço|número|email|valor|observação|obs|pagamento|ref|quantidade|descrição";

function extractLabeledFields(text) {
  const patterns = [];
  const seen = new Set();
  const stop = `(?:${STOP_WORDS})`;

  const rules = [
    { type: "total_value", regex: new RegExp(`valor\\s+total\\s*[:.]?\\s*(.+?)(?=\\s+(?:${STOP_WORDS})|$)`, "gi") },
    { type: "client", regex: new RegExp(`cliente\\s*[:.]?\\s*(.+?)(?=\\s+(?:${STOP_WORDS})|$)`, "gi") },
    { type: "name", regex: new RegExp(`nome\\s*[:.]?\\s*(.+?)(?=\\s+(?:${STOP_WORDS})|$)`, "gi") },
    { type: "value", regex: new RegExp(`valor(?!\\s+total)\\s*[:.]?\\s*(.+?)(?=\\s+(?:${STOP_WORDS})|$)`, "gi") },
  ];

  for (const rule of rules) {
    let match;
    while ((match = rule.regex.exec(text)) !== null) {
      const value = match[1].replace(/\s+/g, " ").trim();
      if (!value || value.length < 2) continue;
      const key = `${rule.type}:${value}`;
      if (seen.has(key)) continue;
      seen.add(key);
      patterns.push({ type: rule.type, value });
    }
  }

  return patterns;
}

function extractPatterns(text) {
  const patterns = [];

  const cpfs = text.match(CPF_REGEX) || [];
  cpfs.forEach((v) => patterns.push({ type: "cpf", value: v }));

  const cnpjs = text.match(CNPJ_REGEX) || [];
  cnpjs.forEach((v) => patterns.push({ type: "cnpj", value: v }));

  const currencies = text.match(CURRENCY_REGEX) || [];
  currencies.forEach((v) => patterns.push({ type: "currency", value: v }));

  const dates = text.match(DATE_REGEX) || [];
  dates.forEach((v) => patterns.push({ type: "date", value: v }));

  const docNumbers = text.match(DOC_NUMBER_REGEX) || [];
  docNumbers.forEach((v) => patterns.push({ type: "document_number", value: v }));

  const labeled = extractLabeledFields(text);
  patterns.push(...labeled);

  return patterns;
}

module.exports = {
  extractPatterns,
  extractLabeledFields,
  CPF_REGEX,
  CNPJ_REGEX,
  CURRENCY_REGEX,
  DATE_REGEX,
  DOC_NUMBER_REGEX,
};
