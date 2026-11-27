export type Author = "profissional" | "paciente";
export interface Message {
  id: number;
  author: Author;
  text: string;
  time: string;
}

export const PROFESSIONAL_QUICK = [
  "Bom dia, por favor sente-se",
  "Aguarde a triagem",
  "Onde você sente dor?",
  "Trouxe cartão do SUS ou receita?",
  "A vacina será aplicada agora",
] as const;

export const PATIENT_QUICK = [
  "Sim",
  "Não",
  "Não compreendi",
  "Preciso de ajuda",
  "Sinto dor",
  "Tomei o remédio",
] as const;

/** Remove padrões de dados sensíveis (CPF, cartão SUS) antes de manter em memória. */
export function redactSensitive(text: string): string {
  return text
    .replace(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g, "[dado removido]")
    .replace(/\b\d{15}\b/g, "[dado removido]");
}

export function addMessage(list: Message[], author: Author, text: string, now = new Date()): Message[] {
  const clean = redactSensitive(text.trim());
  if (!clean) return list;
  const id = (list.at(-1)?.id ?? 0) + 1;
  const time = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return [...list, { id, author, text: clean, time }];
}
