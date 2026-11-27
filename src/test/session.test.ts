import { describe, expect, it } from "vitest";
import { addMessage, redactSensitive, PATIENT_QUICK, PROFESSIONAL_QUICK } from "@/lib/session";

describe("sessão", () => {
  it("remove CPF do texto mantido em memória", () => {
    expect(redactSensitive("meu cpf é 123.456.789-09")).toBe("meu cpf é [dado removido]");
  });
  it("ignora mensagens vazias", () => {
    expect(addMessage([], "paciente", "   ")).toEqual([]);
  });
  it("tem as 5 ações do profissional e 6 respostas do paciente", () => {
    expect(PROFESSIONAL_QUICK).toHaveLength(5);
    expect(PATIENT_QUICK).toHaveLength(6);
  });
});
