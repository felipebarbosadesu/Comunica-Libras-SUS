/**
 * Classificação de gestos assistivos a partir dos 21 pontos da mão (MediaPipe Hands).
 * Conjunto pequeno e experimental — NÃO é tradução de Libras.
 */
export type Point = { x: number; y: number; z?: number };

export type GestureId = "sim" | "nao" | "espere" | "dor" | "ok" | "A" | "B" | "L" | "V" | "Y";

export const GESTURES: Record<GestureId, { label: string; message: string; hint: string }> = {
  sim: { label: "Sim", message: "Sim", hint: "polegar para cima" },
  nao: { label: "Não", message: "Não", hint: "polegar para baixo" },
  espere: { label: "Espere", message: "Espere, por favor", hint: "mão aberta" },
  dor: { label: "Dor", message: "Sinto dor", hint: "mão fechada" },
  ok: { label: "OK", message: "Está tudo bem", hint: "polegar e indicador em círculo" },
  A: { label: "Letra A", message: "A", hint: "alfabeto manual" },
  B: { label: "Letra B", message: "B", hint: "alfabeto manual" },
  L: { label: "Letra L", message: "L", hint: "alfabeto manual" },
  V: { label: "Letra V", message: "V", hint: "alfabeto manual" },
  Y: { label: "Letra Y", message: "Y", hint: "alfabeto manual" },
};

const d = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

/** [ponta, articulação PIP] para indicador, médio, anelar, mínimo. */
const FINGERS: [number, number][] = [[8, 6], [12, 10], [16, 14], [20, 18]];

export function classifyHand(pts: Point[]): GestureId | null {
  if (pts.length < 21) return null;
  const lm = (i: number): Point => pts[i] ?? { x: 0, y: 0 };
  const wrist = lm(0);
  const palm = d(wrist, lm(9)) || 1;
  const ext = FINGERS.map(([tip, pip]) => d(wrist, lm(tip)) > d(wrist, lm(pip)) * 1.15);
  const [index, middle, ring, pinky] = ext;
  const thumb = d(lm(4), lm(5)) > palm * 0.5;
  const curled = ext.every((e) => !e);

  if (d(lm(4), lm(8)) < palm * 0.25 && middle && ring && pinky) return "ok";
  if (thumb && curled) {
    if (lm(4).y < lm(2).y - palm * 0.3) return "sim";
    if (lm(4).y > lm(2).y + palm * 0.3) return "nao";
    return "A";
  }
  if (!thumb && index && middle && ring && pinky) return "B";
  if (thumb && index && middle && ring && pinky) return "espere";
  if (thumb && index && !middle && !ring && !pinky) return "L";
  if (thumb && pinky && !index && !middle && !ring) return "Y";
  if (!thumb && index && middle && !ring && !pinky) return "V";
  if (curled && !thumb) return "dor";
  return null;
}

/** Retorna o gesto apenas quando os últimos `n` quadros concordam (evita falsos positivos). */
export function classifyStable(recent: (GestureId | null)[], n = 10): GestureId | null {
  if (recent.length < n) return null;
  const last = recent.slice(-n);
  return last[0] !== null && last.every((g) => g === last[0]) ? (last[0] ?? null) : null;
}
