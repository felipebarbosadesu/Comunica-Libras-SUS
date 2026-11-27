/**
 * VideoAdapter — câmera/microfone locais para o teleatendimento.
 * A sinalização WebRTC (conexão com o outro participante) fica para integração futura.
 * Nada é gravado: o fluxo existe apenas enquanto a chamada está ativa.
 */
export interface VideoAdapter {
  startLocal(): Promise<MediaStream>;
  stop(stream: MediaStream | null): void;
}

export function createBrowserVideoAdapter(): VideoAdapter {
  return {
    async startLocal() {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("Câmera não suportada neste navegador.");
      return navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    },
    stop(stream) {
      stream?.getTracks().forEach((t) => t.stop());
    },
  };
}
