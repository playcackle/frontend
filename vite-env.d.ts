/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_LOBBY_MANAGER_URL: string;
  readonly VITE_CONTENT_SERVICE_URL: string;
  readonly VITE_PLAYER_SERVICE_URL: string;
  readonly VITE_LAUNCHED: string;
  readonly VITE_DISCORD_URL: string;
  readonly VITE_SENTRY_DSN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
