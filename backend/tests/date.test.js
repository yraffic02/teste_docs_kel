const { DATE_REGEX } = require("../src/shared/patterns");

describe("Date extraction", () => {
  test("matches dd/mm/yyyy format", () => {
    const text = "15/03/2024";
    const matches = text.match(DATE_REGEX);
    expect(matches).toHaveLength(1);
    expect(matches[0]).toBe("15/03/2024");
  });

  test("matches dd-mm-yyyy format", () => {
    const text = "01-01-2024";
    const matches = text.match(DATE_REGEX);
    expect(matches).toHaveLength(1);
    expect(matches[0]).toBe("01-01-2024");
  });

  test("matches yyyy/mm/dd format", () => {
    const text = "2024/12/31";
    const matches = text.match(DATE_REGEX);
    expect(matches).toHaveLength(1);
    expect(matches[0]).toBe("2024/12/31");
  });

  test("matches yyyy-mm-dd format", () => {
    const text = "2024-12-31";
    const matches = text.match(DATE_REGEX);
    expect(matches).toHaveLength(1);
    expect(matches[0]).toBe("2024-12-31");
  });

  test("matches dates with 2-digit year", () => {
    const text = "15/03/24";
    const matches = text.match(DATE_REGEX);
    expect(matches).toHaveLength(1);
    expect(matches[0]).toBe("15/03/24");
  });

  test("extracts dates from paragraph text", () => {
    const text = "O contrato foi assinado em 10/01/2024 e vigora até 31/12/2026.";
    const matches = text.match(DATE_REGEX);
    expect(matches).toHaveLength(2);
    expect(matches[0]).toBe("10/01/2024");
    expect(matches[1]).toBe("31/12/2026");
  });

  test("does not match invalid date-like patterns", () => {
    const text = "99/99/9999 não é uma data real, mas o regex captura formato";
    const matches = text.match(DATE_REGEX);
    expect(matches).toHaveLength(1);
  });

  test("returns null for text without dates", () => {
    const text = "Texto sem datas.";
    const matches = text.match(DATE_REGEX);
    expect(matches).toBeNull();
  });
});
