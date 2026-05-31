import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

export type LobbyInfo = {
  lobby_id: string;
  collection_name: string;
  status: string;
  player_count: number;
  max_players?: number | null;
  join_base_url?: string | null;
  game_ws_url?: string | null;
  admin_base_url?: string | null;
  discord_invite_url?: string | null;
  discord_status?: string | null;
};

type ActiveLobbyRow = LobbyInfo & {
  visibility?: string | null;
};

export type PublicLobbiesState = {
  lobbies: LobbyInfo[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

function mapLobbyRow(row: ActiveLobbyRow): LobbyInfo {
  return {
    lobby_id: row.lobby_id,
    collection_name: row.collection_name || "Unknown Collection",
    status: row.status,
    player_count: row.player_count,
    max_players: row.max_players,
    join_base_url: row.join_base_url,
    game_ws_url: row.game_ws_url,
    admin_base_url: row.admin_base_url,
    discord_invite_url: row.discord_invite_url,
    discord_status: row.discord_status,
  };
}

function upsertLobby(lobbies: LobbyInfo[], lobby: LobbyInfo): LobbyInfo[] {
  const exists = lobbies.some((current) => current.lobby_id === lobby.lobby_id);
  if (!exists) return [...lobbies, lobby];
  return lobbies.map((current) =>
    current.lobby_id === lobby.lobby_id ? lobby : current,
  );
}

function applyLobbyChange(
  lobbies: LobbyInfo[],
  payload: RealtimePostgresChangesPayload<ActiveLobbyRow>,
): LobbyInfo[] {
  if (payload.eventType === "DELETE") {
    return lobbies.filter((lobby) => lobby.lobby_id !== payload.old.lobby_id);
  }

  const row = payload.new;
  if (!row?.lobby_id) return lobbies;

  if (row.visibility !== "public") {
    return lobbies.filter((lobby) => lobby.lobby_id !== row.lobby_id);
  }

  return upsertLobby(lobbies, mapLobbyRow(row));
}

async function fetchLobbyManagerSnapshot(): Promise<LobbyInfo[]> {
  const baseUrl = import.meta.env.VITE_LOBBY_MANAGER_URL;
  if (!baseUrl) throw new Error("Missing VITE_LOBBY_MANAGER_URL");

  const response = await fetch(`${baseUrl}/lobbies`);
  if (!response.ok) {
    throw new Error(`Lobby manager returned ${response.status}`);
  }

  return response.json();
}

export function usePublicLobbies(): PublicLobbiesState {
  const [lobbies, setLobbies] = useState<LobbyInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = useMemo(() => createClient(), []);

  async function loadSnapshot() {
    setLoading(true);
    setError(null);

    const { data, error: supabaseError } = await supabase
      .from("activelobby")
      .select(
        "lobby_id, collection_name, status, player_count, max_players, join_base_url, game_ws_url, admin_base_url, discord_invite_url, discord_status, visibility",
      )
      .eq("visibility", "public");

    if (!supabaseError) {
      setLobbies(((data ?? []) as ActiveLobbyRow[]).map(mapLobbyRow));
      setLoading(false);
      return;
    }

    console.warn("Supabase lobby snapshot failed; falling back to lobby_manager", supabaseError);

    try {
      setLobbies(await fetchLobbyManagerSnapshot());
    } catch (fallbackError) {
      console.error("Failed to fetch public lobbies", fallbackError);
      setError(
        fallbackError instanceof Error
          ? fallbackError.message
          : "Failed to load game rooms",
      );
      setLobbies([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const channel = supabase
      .channel("public:activelobby")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "activelobby",
        },
        (payload: RealtimePostgresChangesPayload<ActiveLobbyRow>) => {
          setLobbies((current) => applyLobbyChange(current, payload));
        },
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          console.warn("Supabase lobby realtime subscription issue", { status });
        }
      });

    void loadSnapshot();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return { lobbies, loading, error, refetch: loadSnapshot };
}

/**
 * Backwards-compatible wrapper for older callers. Prefer usePublicLobbies for
 * new lobby browser UI so existing rows are hydrated from Supabase directly.
 */
export function useRealtimeLobbies(initialLobbies: LobbyInfo[]) {
  const { lobbies, loading } = usePublicLobbies();
  return loading && lobbies.length === 0 ? initialLobbies : lobbies;
}
