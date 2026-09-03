/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Dirección base de la API. Si no se define, se asume el servidor local. */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
