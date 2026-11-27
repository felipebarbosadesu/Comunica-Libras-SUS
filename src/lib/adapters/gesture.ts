/**
 * GestureAdapter — detecção de mão 100% local no navegador (MediaPipe HandLandmarker).
 * Nenhum quadro de vídeo é salvo ou enviado. Carregado sob demanda, só no navegador.
 */
import { classifyHand, type GestureId, type Point } from "@/lib/gestures";

export type GestureFrame = { landmarks: Point[] | null; gesture: GestureId | null };

export interface GestureAdapter {
  load(): Promise<void>;
  start(video: HTMLVideoElement, onFrame: (f: GestureFrame) => void): void;
  stop(): void;
}

const WASM = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm";
const MODEL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

export function createMediaPipeGestureAdapter(): GestureAdapter {
  let detector: {
    detectForVideo(v: HTMLVideoElement, t: number): { landmarks: Point[][] };
    close(): void;
  } | null = null;
  let raf = 0;
  return {
    async load() {
      if (detector) return;
      const { FilesetResolver, HandLandmarker } = await import("@mediapipe/tasks-vision");
      const fileset = await FilesetResolver.forVisionTasks(WASM);
      detector = (await HandLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: MODEL, delegate: "GPU" },
        runningMode: "VIDEO",
        numHands: 1,
      })) as unknown as typeof detector;
    },
    start(video, onFrame) {
      let lastT = -1;
      const loop = () => {
        if (detector && video.readyState >= 2 && video.currentTime !== lastT) {
          lastT = video.currentTime;
          const lm = detector.detectForVideo(video, performance.now()).landmarks[0] ?? null;
          onFrame({ landmarks: lm, gesture: lm ? classifyHand(lm) : null });
        }
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    },
    stop() {
      cancelAnimationFrame(raf);
    },
  };
}

export function createMockGestureAdapter(frames: GestureFrame[]): GestureAdapter {
  return {
    async load() {},
    start(_v, onFrame) {
      frames.forEach(onFrame);
    },
    stop() {},
  };
}
