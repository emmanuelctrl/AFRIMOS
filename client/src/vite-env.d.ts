/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Optional override for the hero backdrop photograph. Unset in normal
   * builds — the hero then probes `public/hero-port.*` instead.
   */
  readonly VITE_HERO_IMAGE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
