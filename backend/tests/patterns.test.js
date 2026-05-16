const { extractPatterns, extractLabeledFields } = require("../src/shared/patterns");

describe("extractPatterns", () => {
  test("extracts CPF from text", () => {
    const text = "O CPF do cliente é 123.456.789-09 e também 98765432100.";
    const result = extractPatterns(text);
    const cpfs = result.filter((p) => p.type === "cpf");
    expect(cpfs).toHaveLength(2);
    expect(cpfs[0].value).toBe("123.456.789-09");
    expect(cpfs[1].value).toBe("98765432100");
  });

  test("extracts CNPJ from text", () => {
    const text = "CNPJ: 11.222.333/0001-81 da empresa parceira.";
    const result = extractPatterns(text);
    const cnpjs = result.filter((p) => p.type === "cnpj");
    expect(cnpjs).toHaveLength(1);
    expect(cnpjs[0].value).toBe("11.222.333/0001-81");
  });

  test("extracts currency values", () => {
    const text = "Valor total: R$ 1.234,56 e tamb\u00e9m USD 500.00.";
    const result = extractPatterns(text);
    const currencies = result.filter((p) => p.type === "currency");
    expect(currencies.length).toBeGreaterThanOrEqual(2);
  });

  test("extracts dates in multiple formats", () => {
    const text = "Datas: 15/03/2024, 01-01-2024 e 2024-12-31.";
    const result = extractPatterns(text);
    const dates = result.filter((p) => p.type === "date");
    expect(dates).toHaveLength(3);
    expect(dates[0].value).toBe("15/03/2024");
    expect(dates[1].value).toBe("01-01-2024");
    expect(dates[2].value).toBe("2024-12-31");
  });

  test("returns empty array for text without patterns", () => {
    const text = "Texto simples sem padr\u00f5es estruturados.";
    expect(extractPatterns(text)).toEqual([]);
  });

  test("handles multiple patterns in one document", () => {
    const text = [
      "Cliente: Jo\u00e3o Silva",
      "CPF: 529.982.247-25",
      "Valor: R$ 15.000,00",
      "Data: 10/01/2024",
    ].join("\n");
    const result = extractPatterns(text);
    expect(result.filter((p) => p.type === "cpf")).toHaveLength(1);
    expect(result.filter((p) => p.type === "currency")).toHaveLength(1);
    expect(result.filter((p) => p.type === "date")).toHaveLength(1);
    expect(result.filter((p) => p.type === "client")).toHaveLength(1);
  });

  test("extracts document_number from RG format", () => {
    const text = "RG: 12.345.678-9 do cidadao.";
    const result = extractPatterns(text);
    const docs = result.filter((p) => p.type === "document_number");
    expect(docs).toHaveLength(1);
    expect(docs[0].value).toBe("12.345.678-9");
  });

  test("extracts document_number from passport format", () => {
    const text = "Passaporte AB1234567 do viajante.";
    const result = extractPatterns(text);
    const docs = result.filter((p) => p.type === "document_number");
    expect(docs).toHaveLength(1);
    expect(docs[0].value).toBe("AB1234567");
  });

  test("does not confuse CPF with document_number", () => {
    const text = "CPF 529.982.247-25 e RG 12.345.678-9.";
    const result = extractPatterns(text);
    const cpfs = result.filter((p) => p.type === "cpf");
    const docs = result.filter((p) => p.type === "document_number");
    expect(cpfs).toHaveLength(1);
    expect(docs).toHaveLength(1);
    expect(cpfs[0].value).toBe("529.982.247-25");
    expect(docs[0].value).toBe("12.345.678-9");
  });
});

describe("extractLabeledFields", () => {
  test("extracts name field", () => {
    const text = "Nome: Jo\u00e3o Silva\nCPF: 123.456.789-09";
    const result = extractLabeledFields(text);
    expect(result).toContainEqual({ type: "name", value: "Jo\u00e3o Silva" });
  });

  test("extracts client field", () => {
    const text = "Cliente: Maria Oliveira\nValor: R$ 5.000,00";
    const result = extractLabeledFields(text);
    expect(result).toContainEqual({ type: "client", value: "Maria Oliveira" });
  });

  test("extracts value and total_value separately", () => {
    const text = "Valor: R$ 1.500,00\nValor total: R$ 15.000,00";
    const result = extractLabeledFields(text);
    expect(result).toContainEqual({ type: "value", value: "R$ 1.500,00" });
    expect(result).toContainEqual({ type: "total_value", value: "R$ 15.000,00" });
  });

  test("handles dot separator", () => {
    const text = "Nome. Jo\u00e3o Silva";
    const result = extractLabeledFields(text);
    expect(result).toContainEqual({ type: "name", value: "Jo\u00e3o Silva" });
  });

  test("returns empty for text without labeled fields", () => {
    const text = "Texto livre sem campos rotulados.";
    expect(extractLabeledFields(text)).toEqual([]);
  });

  test("extracts multiple labeled fields from document", () => {
    const text = [
      "Nome: Pedro Santos",
      "Cliente: Tech Ltda",
      "Valor: R$ 8.000,00",
      "Valor total: R$ 8.000,00",
    ].join("\n");
    const result = extractLabeledFields(text);
    expect(result).toHaveLength(4);
    expect(result.filter((p) => p.type === "name")).toHaveLength(1);
    expect(result.filter((p) => p.type === "client")).toHaveLength(1);
    expect(result.filter((p) => p.type === "value")).toHaveLength(1);
    expect(result.filter((p) => p.type === "total_value")).toHaveLength(1);
  });
});
