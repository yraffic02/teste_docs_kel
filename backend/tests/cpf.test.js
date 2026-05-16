const { CPF_REGEX } = require("../src/shared/patterns");

describe("CPF extraction", () => {
  test("matches CPF with dots and dash", () => {
    const text = "529.982.247-25";
    const matches = text.match(CPF_REGEX);
    expect(matches).not.toBeNull();
    expect(matches[0]).toBe("529.982.247-25");
  });

  test("matches CPF with only numbers", () => {
    const text = "52998224725";
    const matches = text.match(CPF_REGEX);
    expect(matches).not.toBeNull();
  });

  test("matches CPF with partial formatting", () => {
    const text = "529982247-25";
    const matches = text.match(CPF_REGEX);
    expect(matches).not.toBeNull();
  });

  test("does not match invalid short sequence", () => {
    const text = "12345";
    const matches = text.match(CPF_REGEX);
    expect(matches).toBeNull();
  });

  test("extracts CPF from mixed text", () => {
    const text = "Documento: 123.456.789-09 (válido)";
    const matches = text.match(CPF_REGEX);
    expect(matches).toHaveLength(1);
    expect(matches[0]).toBe("123.456.789-09");
  });

  test("extracts multiple CPFs", () => {
    const text = "CPF1: 529.982.247-25 e CPF2: 123.456.789-09";
    const matches = text.match(CPF_REGEX);
    expect(matches).toHaveLength(2);
  });
});
