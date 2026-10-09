// Tiny event bus so the avatar, windows and desktop can talk without prop drilling.
export type TonnyEvents = {
  "tonny-say": { text: string; ms?: number; mood?: import("@/components/PixelGirl").Expression };
  "tonny-drink": { text?: string };
  "tonny-walk": { x: number; y: number };
  "tonny-open": { id: string };
};

export function emit<K extends keyof TonnyEvents>(name: K, detail: TonnyEvents[K]) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

export function on<K extends keyof TonnyEvents>(name: K, fn: (d: TonnyEvents[K]) => void) {
  const handler = (e: Event) => fn((e as CustomEvent<TonnyEvents[K]>).detail);
  window.addEventListener(name, handler);
  return () => window.removeEventListener(name, handler);
}
