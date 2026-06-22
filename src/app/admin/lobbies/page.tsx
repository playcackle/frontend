import { useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { lobbiesApi, type Lobby } from "@/lib/api/admin";
import { Settings, Trash2 } from "lucide-react";
import styles from "./page.module.css";
import { Toasts, useToasts } from "@/app/admin/components/Toasts";
import { useConfirm } from "@/app/admin/components/ConfirmDialog";

export default function LobbiesPage() {
  const navigate = useNavigate();
  const { toasts, showToast } = useToasts();
  const { confirm, confirmDialog } = useConfirm();
  const [lobbies, setLobbies] = useState<Lobby[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [spawning, setSpawning] = useState(false);
  const [tearingDown, setTearingDown] = useState<string | null>(null);

  // Load lobbies on mount and refresh every 5 seconds
  useEffect(() => {
    loadLobbies();
    const interval = setInterval(loadLobbies, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadLobbies = async () => {
    try {
      setError(null);
      const data = await lobbiesApi.getAll();
      setLobbies((data || []).sort((a, b) => a.lobby_id.localeCompare(b.lobby_id)));
    } catch (err) {
      console.error("Failed to load lobbies:", err);
      setError(err instanceof Error ? err.message : "Failed to load lobbies");
      setLobbies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSpawn = async () => {
    setSpawning(true);
    try {
      const result = await lobbiesApi.allocateRoom();
      showToast(`Created room ${result.lobby_id} on server ${result.server_id ?? "?"}`);
      loadLobbies();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to create room", "error");
    } finally {
      setSpawning(false);
    }
  };

  const handleDeleteRoom = async (lobbyId: string) => {
    if (
      !(await confirm({
        title: "Delete this room?",
        message: `Removes ${lobbyId} from its multi-tenant server. The server keeps running and serving its other rooms.`,
        confirmLabel: "Delete",
        danger: true,
      }))
    ) {
      return;
    }
    setTearingDown(lobbyId);
    try {
      await lobbiesApi.deleteRoom(lobbyId);
      showToast("Room deleted");
      loadLobbies();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to delete room", "error");
    } finally {
      setTearingDown(null);
    }
  };

  const handleConfigure = (lobbyId: string) => {
    navigate({ to: `/admin/lobbies/${lobbyId}` });
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "WAITING":
        return "#ffc107";
      case "IN_ROUND":
        return "#00ff00";
      case "ROUND_BREAK":
        return "#00ffff";
      case "GAME_OVER":
        return "#ff00ff";
      default:
        return "#999";
    }
  };

  const getVisibilityColor = (visibility: string | undefined) => {
    switch (visibility) {
      case "public":
        return "#00ff88";
      case "private":
        return "#ff8800";
      case "hidden":
        return "#888888";
      default:
        return "#888888";
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <span className={styles.neonText}>ACTIVE</span>
          <span className={styles.neonTextPink}>GAMEROOMS</span>
        </h1>
        <p className={styles.subtitle}>
          Monitor and configure running gameroom instances
        </p>
        <button
          className={styles.spawnButton}
          onClick={handleSpawn}
          disabled={spawning}
        >
          {spawning ? "Creating..." : "Create Room"}
        </button>
      </div>

      {/* Error State */}
      {error && !loading && (
        <div className={styles.errorContainer}>
          <div className={styles.errorBox}>
            <h3>Failed to load gamerooms</h3>
            <p>{error}</p>
            <button className={styles.retryButton} onClick={loadLobbies}>
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading gamerooms...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && lobbies.length === 0 && (
        <div className={styles.emptyState}>
          <p className={styles.emptyMessage}>
            No active gamerooms found. Start a gameroom service to see it appear here.
          </p>
        </div>
      )}

      {/* Lobbies Grid */}
      {!loading && !error && lobbies.length > 0 && (
        <div className={styles.lobbiesGrid}>
          {lobbies.map((lobby) => (
            <div key={lobby.lobby_id} className={styles.lobbyCard}>
              <div className={styles.lobbyHeader}>
                <h3 className={styles.lobbyTitle}>
                  <span className={styles.lobbyId}>#{lobby.lobby_id}</span>
                  <span
                    className={styles.visibilityBadge}
                    style={{ color: getVisibilityColor(lobby.visibility) }}
                  >
                    {lobby.visibility || "public"}
                  </span>
                </h3>
                <div
                  className={styles.statusBadge}
                  style={{ backgroundColor: getStatusColor(lobby.status) }}
                >
                  {lobby.status}
                </div>
              </div>

              <div className={styles.lobbyInfo}>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Players:</span>
                  <span className={styles.infoValue}>{lobby.player_count}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Collection:</span>
                  <span className={styles.infoValue}>
                    {lobby.collection_name || "None"}
                  </span>
                </div>
              </div>

              <div className={styles.lobbyActions}>
                <button
                  className={styles.iconButton}
                  onClick={() => handleConfigure(lobby.lobby_id)}
                  title="Configure"
                >
                  <Settings size={16} />
                </button>
                {lobby.server_id && (
                  <button
                    className={styles.iconButtonDanger}
                    onClick={() => handleDeleteRoom(lobby.lobby_id)}
                    disabled={tearingDown === lobby.lobby_id}
                    title={tearingDown === lobby.lobby_id ? "Deleting..." : "Delete room"}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
                {lobby.is_baseline && (
                  <span className={styles.spawnedBadge}>baseline #{lobby.baseline_slot ?? "?"}</span>
                )}
                {lobby.server_id && (
                  <span className={styles.spawnedBadge}>multi-tenant</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Toasts toasts={toasts} />
      {confirmDialog}
    </div>
  );
}
