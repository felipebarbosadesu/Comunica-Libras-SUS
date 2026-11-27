import { describe, expect, it } from "vitest";
import { classifyHand, classifyStable, type Point } from "@/lib/gestures";

/** Monta uma mão sintética: wrist em (0.5,0.8), palma para cima (y menor = mais alto). */
function hand(opts: {
  thumb: "up" | "down" | "side" | "in";
  fingers: [boolean, boolean, boolean, boolean];
}): Point[] {
  const p: Point[] = Array.from({ length: 21 }, () => ({ x: 0.5, y: 0.8 }));
  p[0] = { x: 0.5, y: 0.8 };
  // Polegar: 1..4
  p[1] = { x: 0.44, y: 0.75 };
  p[2] = { x: 0.4, y: 0.7 };
  p[3] = { x: 0.38, y: 0.66 };
  const thumbTip = {
    up: { x: 0.38, y: 0.5 },
    down: { x: 0.38, y: 0.9 },
    side: { x: 0.25, y: 0.65 },
    in: { x: 0.48, y: 0.62 },
  }[opts.thumb];
  p[4] = thumbTip;
  const xs = [0.44, 0.5, 0.56, 0.62];
  opts.fingers.forEach((ext, i) => {
    const b = 5 + i * 4,
      x = xs[i]!;
    p[b] = { x, y: 0.6 };
    p[b + 1] = { x, y: 0.5 };
    p[b + 2] = { x, y: ext ? 0.42 : 0.55 };
    p[b + 3] = { x, y: ext ? 0.35 : 0.62 };
  });
  return p;
}

describe("classifyHand", () => {
  it("polegar para cima com dedos fechados = Sim", () => {
    expect(classifyHand(hand({ thumb: "up", fingers: [false, false, false, false] }))).toBe("sim");
  });
  it("polegar para baixo = Não", () => {
    expect(classifyHand(hand({ thumb: "down", fingers: [false, false, false, false] }))).toBe(
      "nao",
    );
  });
  it("mão aberta = Espere", () => {
    expect(classifyHand(hand({ thumb: "side", fingers: [true, true, true, true] }))).toBe("espere");
  });
  it("mão fechada = Dor", () => {
    expect(classifyHand(hand({ thumb: "in", fingers: [false, false, false, false] }))).toBe("dor");
  });
  it("punho com polegar ao lado = A", () => {
    expect(classifyHand(hand({ thumb: "side", fingers: [false, false, false, false] }))).toBe("A");
  });
  it("quatro dedos esticados e polegar dobrado = B", () => {
    expect(classifyHand(hand({ thumb: "in", fingers: [true, true, true, true] }))).toBe("B");
  });
  it("indicador e médio = V", () => {
    expect(classifyHand(hand({ thumb: "in", fingers: [true, true, false, false] }))).toBe("V");
  });
});

describe("classifyStable", () => {
  it("só confirma após 10 quadros iguais", () => {
    expect(classifyStable(Array(10).fill("sim"))).toBe("sim");
    expect(classifyStable(Array(9).fill("sim"))).toBeNull();
  });
  it("troca rápida de gesto não gera resultado", () => {
    expect(classifyStable([...Array(9).fill("sim"), "nao"])).toBeNull();
  });
});
