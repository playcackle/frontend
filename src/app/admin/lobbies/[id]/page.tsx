import { useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import {
  lobbiesApi,
  collectionsApi,
  hostSettingsApi,
  fuzzyMatchConfigApi,
  type Lobby,
  type Collection,
  type GameConfigurationParameters,
  type HostSettings,
  type FuzzyMatchConfig,
} from "@/lib/api/admin";
import * as Select from "@radix-ui/react-select";
import { ChevronDown } from "lucide-react";
import styles from "./page.module.css";
import { BotControls } from "./components/BotControls";
import { Toasts, useToasts } from "@/app/admin/components/Toasts";
import { useConfirm } from "@/app/admin/components/ConfirmDialog";

export default function LobbyDetailPage({ id }: { id: string }) {
  const navigate = useNavigate();
  const lobbyId = id;

  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [forceStarting, setForceStarting] = useState(false);

  // Parameter state
  const [config, setConfig] = useState<GameConfigurationParameters>({
    num_rounds: 10,
    round_duration: 150,
    round_break_duration: 90,
    max_normal_slots: 8,
    max_rare_slots: 2,
    min_players_to_start: 2,
    game_start_delay: 10,
    new_game_wait_duration: 30,
    points_normal_slot: 100,
    points_rare_slot: 250,
    max_players: 25,
  });

  const [selectedCollection, setSelectedCollection] = useState<number | null>(null);
  const [visibility, setVisibility] = useState<"public" | "private" | "hidden">("public");
  const [visibilitySaving, setVisibilitySaving] = useState(false);
  const [pendingInfo, setPendingInfo] = useState<{ config: boolean; topics: boolean }>({
    config: false,
    topics: false,
  });

  // Lightweight, non-blocking notifications (replaces alert()).
  const { toasts, showToast } = useToasts();
  const { confirm, confirmDialog } = useConfirm();

  // Host settings state
  const [hostSettings, setHostSettings] = useState<HostSettings | null>(null);
  const [hostSettingsLoading, setHostSettingsLoading] = useState(false);
  const [hostSettingsSaving, setHostSettingsSaving] = useState(false);

  // Fuzzy match config state
  const [fuzzyMatchConfig, setFuzzyMatchConfig] = useState<FuzzyMatchConfig | null>(null);
  const [fuzzyMatchLoading, setFuzzyMatchLoading] = useState(false);
  const [fuzzyMatchSaving, setFuzzyMatchSaving] = useState(false);

  const refreshLobbyState = useCallback(async () => {
    try {
      const [lobbyData, gameroomConfig] = await Promise.all([
        lobbiesApi.getById(lobbyId),
        lobbiesApi.getGameroomConfig(lobbyId).catch(() => null),
      ]);
      setLobby(lobbyData);
      if (gameroomConfig) {
        setPendingInfo({
          config: Boolean(gameroomConfig.has_pending_config),
          topics: Boolean(gameroomConfig.has_pending_topics),
        });
      }
    } catch (err) {
      console.error("Failed to refresh lobby state:", err);
    }
  }, [lobbyId]);

  useEffect(() => {
    loadData();
  }, [lobbyId]);

  useEffect(() => {
    refreshLobbyState();
    const interval = setInterval(refreshLobbyState, 5000);
    return () => clearInterval(interval);
  }, [refreshLobbyState]);

  const handleBotsChanged = useCallback(() => {
    refreshLobbyState();
    setTimeout(refreshLobbyState, 1000);
  }, [refreshLobbyState]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [lobbyData, collectionsData] = await Promise.all([
        lobbiesApi.getById(lobbyId),
        collectionsApi.getAll(),
      ]);

      setLobby(lobbyData);
      setCollections(collectionsData);

      // Set config from lobby or use defaults
      if (lobbyData.configuration) {
        setConfig((prev) => ({ ...prev, ...lobbyData.configuration }));
      }

      if (lobbyData.collection_id) {
        setSelectedCollection(lobbyData.collection_id);
      }

      if (lobbyData.visibility) {
        setVisibility(lobbyData.visibility);
      }

      // Load host settings and fuzzy match config
      loadHostSettings();
      loadFuzzyMatchConfig();
    } catch (err) {
      console.error("Failed to load lobby:", err);
      setError(err instanceof Error ? err.message : "Failed to load lobby");
    } finally {
      setLoading(false);
    }
  };

  const loadHostSettings = async () => {
    try {
      setHostSettingsLoading(true);
      const settings = await hostSettingsApi.get(lobbyId);
      setHostSettings(settings);
    } catch (err) {
      console.error("Failed to load host settings:", err);
      // Don't set error state, just log it - host settings are optional
    } finally {
      setHostSettingsLoading(false);
    }
  };

  const loadFuzzyMatchConfig = async () => {
    try {
      setFuzzyMatchLoading(true);
      const config = await fuzzyMatchConfigApi.get(lobbyId);
      setFuzzyMatchConfig(config);
    } catch (err) {
      console.error("Failed to load fuzzy match config:", err);
      // Don't set error state, just log it - optional
    } finally {
      setFuzzyMatchLoading(false);
    }
  };

  const updateHostSetting = async <K extends keyof HostSettings>(
    key: K,
    value: HostSettings[K]
  ) => {
    if (!hostSettings) return;

    try {
      setHostSettingsSaving(true);
      const updated = await hostSettingsApi.update(lobbyId, {
        [key]: value,
      });
      setHostSettings(updated);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to update host setting", "error");
      // Revert the change in UI
      loadHostSettings();
    } finally {
      setHostSettingsSaving(false);
    }
  };

  const updateFuzzyMatchSetting = async <K extends keyof FuzzyMatchConfig>(
    key: K,
    value: FuzzyMatchConfig[K]
  ) => {
    if (!fuzzyMatchConfig) return;

    try {
      setFuzzyMatchSaving(true);
      const updated = await fuzzyMatchConfigApi.update(lobbyId, {
        [key]: value,
      });
      setFuzzyMatchConfig(updated);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to update fuzzy match setting", "error");
      // Revert the change in UI
      loadFuzzyMatchConfig();
    } finally {
      setFuzzyMatchSaving(false);
    }
  };

  const handleSave = async (mode: "on_next_reset" | "immediate") => {
    if (
      mode === "immediate" &&
      !(await confirm({
        title: "Save & reset now?",
        message:
          "This applies your changes immediately and interrupts any active round.",
        confirmLabel: "Save & Reset",
        danger: true,
      }))
    ) {
      return;
    }

    try {
      setSaving(true);
      await lobbiesApi.reconfigure(lobbyId, {
        parameters: config,
        apply_mode: mode,
      });
      showToast(
        mode === "immediate"
          ? "Configuration applied — game reset"
          : "Saved — applies next game"
      );
      loadData();
      refreshLobbyState();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to save configuration", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCollectionSelect = async (collectionId: number) => {
    const previous = selectedCollection;
    setSelectedCollection(collectionId);

    try {
      setSaving(true);
      await lobbiesApi.changeGameroomCollection(lobbyId, {
        collection_id: collectionId,
        apply_immediately: false,
      });
      showToast("Collection queued — applies next game");
      refreshLobbyState();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to change collection", "error");
      setSelectedCollection(previous);
    } finally {
      setSaving(false);
    }
  };

  const handleForceReset = async () => {
    if (
      !(await confirm({
        title: "Force reset this gameroom?",
        message: "This will interrupt active gameplay and apply any pending changes.",
        confirmLabel: "Force Reset",
        danger: true,
      }))
    ) {
      return;
    }

    try {
      await lobbiesApi.forceReset(lobbyId, "Admin forced reset");
      showToast("Gameroom reset");
      loadData();
      refreshLobbyState();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to reset gameroom", "error");
    }
  };

  const handleForceStart = async () => {
    const countdownSeconds = config.game_start_delay || 10;
    // Low-stakes: a stray click just starts a countdown that's reversible by Force Reset.

    try {
      setForceStarting(true);
      await lobbiesApi.forceStart(lobbyId, {
        countdown_seconds: countdownSeconds,
        reason: "Admin forced playtest start",
      });
      showToast(`Starting in ${countdownSeconds}s`);
      loadData();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to force start gameroom", "error");
    } finally {
      setForceStarting(false);
    }
  };

  const handleVisibilityChange = async (newVisibility: "public" | "private" | "hidden") => {
    try {
      setVisibilitySaving(true);
      const result = await lobbiesApi.updateVisibility(lobbyId, newVisibility);
      setVisibility(result.visibility as "public" | "private" | "hidden");
      showToast(`Visibility set to ${newVisibility}`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to update visibility", "error");
      loadData();
    } finally {
      setVisibilitySaving(false);
    }
  };

  const handleResetToDefaults = () => {
    // Low-stakes: only clears local unsaved edits; the server is untouched.

    setConfig({
      num_rounds: 10,
      round_duration: 150,
      round_break_duration: 90,
      max_normal_slots: 8,
      max_rare_slots: 2,
      min_players_to_start: 2,
      game_start_delay: 10,
      new_game_wait_duration: 30,
      points_normal_slot: 100,
      points_rare_slot: 250,
      max_players: 25,
    });
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading gameroom configuration...</p>
        </div>
      </div>
    );
  }

  if (error || !lobby) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <h3>Failed to load gameroom</h3>
          <p>{error}</p>
          <button className={styles.button} onClick={() => window.history.back()}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const canForceStart = lobby.status === "WAITING" && lobby.player_count > 0;
  const hasPending = pendingInfo.config || pendingInfo.topics;
  const pendingLabel =
    pendingInfo.config && pendingInfo.topics
      ? "config + collection"
      : pendingInfo.config
        ? "config changes"
        : "collection change";

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => window.history.back()}>
          ← Back
        </button>
        <h1 className={styles.title}>Gameroom Config</h1>
        <span className={styles.lobbyId}>{lobbyId.slice(0, 16)}</span>
      </div>

      {/* Quick controls — the things changed most often, always visible */}
      <div className={styles.quickControls}>
        <div className={styles.quickCard}>
          <div className={styles.quickLabelRow}>
            <span className={styles.quickLabel}>Visibility</span>
            {visibilitySaving && <span className={styles.savingBadge}>Saving...</span>}
          </div>
          <div className={styles.segmented}>
            {(["public", "private", "hidden"] as const).map((v) => (
              <button
                key={v}
                className={`${styles.segmentedButton} ${visibility === v ? styles.segmentedActive : ""}`}
                onClick={() => handleVisibilityChange(v)}
                disabled={visibilitySaving}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.quickCard}>
          <div className={styles.quickLabelRow}>
            <span className={styles.quickLabel}>Collection</span>
            {pendingInfo.topics && <span className={styles.savingBadge}>Queued</span>}
          </div>
          <Select.Root
            value={selectedCollection?.toString()}
            onValueChange={(value) => handleCollectionSelect(Number(value))}
            disabled={saving}
          >
            <Select.Trigger className={styles.selectTrigger}>
              <Select.Value placeholder="Select a collection" />
              <Select.Icon>
                <ChevronDown size={16} />
              </Select.Icon>
            </Select.Trigger>
            <Select.Portal>
              <Select.Content className={styles.selectContent}>
                <Select.Viewport>
                  {collections.map((collection) => (
                    <Select.Item
                      key={collection.id}
                      value={collection.id.toString()}
                      className={styles.selectItem}
                    >
                      <Select.ItemText>{collection.name}</Select.ItemText>
                    </Select.Item>
                  ))}
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        </div>
      </div>

      {/* Gameplay — structure + players + scoring, open by default */}
      <CollapsibleSection
        title="Gameplay"
        defaultOpen
        headerExtra={
          <button
            className={styles.resetDefaultsButton}
            onClick={handleResetToDefaults}
            disabled={saving}
          >
            Reset to Defaults
          </button>
        }
      >
        <div className={styles.parameterGrid}>
          <ParameterSlider
            label="Number of Rounds"
            value={config.num_rounds || 10}
            onChange={(value) => setConfig({ ...config, num_rounds: value })}
            min={1}
            max={50}
            unit="rounds"
          />
          <ParameterSlider
            label="Max Normal Slots"
            value={config.max_normal_slots || 8}
            onChange={(value) => setConfig({ ...config, max_normal_slots: value })}
            min={1}
            max={20}
            unit="slots"
          />
          <ParameterSlider
            label="Max Rare Slots"
            value={config.max_rare_slots || 2}
            onChange={(value) => setConfig({ ...config, max_rare_slots: value })}
            min={0}
            max={10}
            unit="slots"
          />
          <ParameterSlider
            label="Min Players to Start"
            value={config.min_players_to_start || 2}
            onChange={(value) => setConfig({ ...config, min_players_to_start: value })}
            min={1}
            max={10}
            unit="players"
          />
          <ParameterSlider
            label="Max Players"
            value={config.max_players || 25}
            onChange={(value) => setConfig({ ...config, max_players: value })}
            min={2}
            max={100}
            unit="players"
          />
          <ParameterSlider
            label="Points per Normal Slot"
            value={config.points_normal_slot || 100}
            onChange={(value) => setConfig({ ...config, points_normal_slot: value })}
            min={1}
            max={1000}
            unit="points"
          />
          <ParameterSlider
            label="Points per Rare Slot"
            value={config.points_rare_slot || 250}
            onChange={(value) => setConfig({ ...config, points_rare_slot: value })}
            min={1}
            max={2000}
            unit="points"
          />
        </div>
      </CollapsibleSection>

      {/* Timing */}
      <CollapsibleSection title="Timing">
        <div className={styles.parameterGrid}>
          <ParameterSlider
            label="Round Duration"
            value={config.round_duration || 150}
            onChange={(value) => setConfig({ ...config, round_duration: value })}
            min={30}
            max={600}
            unit="seconds"
          />
          <ParameterSlider
            label="Round Break Duration"
            value={config.round_break_duration || 90}
            onChange={(value) => setConfig({ ...config, round_break_duration: value })}
            min={15}
            max={300}
            unit="seconds"
          />
          <ParameterSlider
            label="Game Start Delay"
            value={config.game_start_delay || 10}
            onChange={(value) => setConfig({ ...config, game_start_delay: value })}
            min={5}
            max={60}
            unit="seconds"
          />
          <ParameterSlider
            label="New Game Wait Time"
            value={config.new_game_wait_duration || 30}
            onChange={(value) => setConfig({ ...config, new_game_wait_duration: value })}
            min={10}
            max={120}
            unit="seconds"
          />
        </div>
      </CollapsibleSection>

      {/* Host Settings (BotBob) */}
      {hostSettings && (
        <CollapsibleSection
          title={
            <>
              Host (BotBob)
              {hostSettingsLoading && <span className={styles.loadingBadge}>Loading...</span>}
            </>
          }
        >
          <div className={styles.hostSettingsGrid}>
            {/* Enable/Disable Host */}
            <div className={styles.toggleControl}>
              <label className={styles.toggleLabel}>
                <input
                  type="checkbox"
                  checked={hostSettings.enabled}
                  onChange={(e) => updateHostSetting("enabled", e.target.checked)}
                  disabled={hostSettingsSaving}
                  className={styles.checkbox}
                />
                Enable Host
              </label>
            </div>

            {/* Welcome Message */}
            <div className={styles.toggleControl}>
              <label className={styles.toggleLabel}>
                <input
                  type="checkbox"
                  checked={hostSettings.welcome_message_enabled}
                  onChange={(e) =>
                    updateHostSetting("welcome_message_enabled", e.target.checked)
                  }
                  disabled={hostSettingsSaving || !hostSettings.enabled}
                  className={styles.checkbox}
                />
                Show Welcome Message
              </label>
            </div>

            {/* Hints Enabled */}
            <div className={styles.toggleControl}>
              <label className={styles.toggleLabel}>
                <input
                  type="checkbox"
                  checked={hostSettings.hints_enabled}
                  onChange={(e) => updateHostSetting("hints_enabled", e.target.checked)}
                  disabled={hostSettingsSaving || !hostSettings.enabled}
                  className={styles.checkbox}
                />
                Enable Hints
              </label>
            </div>
          </div>

          {/* Hint Timing */}
          {hostSettings.hints_enabled && (
            <div className={styles.parameterGrid}>
              <ParameterSlider
                label="Initial Hint Delay"
                value={hostSettings.hint_delay_seconds}
                onChange={(value) => updateHostSetting("hint_delay_seconds", value)}
                min={10}
                max={120}
                unit="seconds"
              />
              <ParameterSlider
                label="Normal Hint Interval"
                value={hostSettings.hint_interval_seconds}
                onChange={(value) => updateHostSetting("hint_interval_seconds", value)}
                min={10}
                max={120}
                unit="seconds"
              />
              <ParameterSlider
                label="Max Hints per Round"
                value={hostSettings.max_hints_per_round}
                onChange={(value) => updateHostSetting("max_hints_per_round", value)}
                min={0}
                max={20}
                unit="hints"
                description="0 = unlimited hints"
              />
            </div>
          )}

          {/* Urgency Mode */}
          {hostSettings.hints_enabled && (
            <>
              <div className={styles.toggleControl}>
                <label className={styles.toggleLabel}>
                  <input
                    type="checkbox"
                    checked={hostSettings.urgency_enabled}
                    onChange={(e) => updateHostSetting("urgency_enabled", e.target.checked)}
                    disabled={hostSettingsSaving || !hostSettings.enabled}
                    className={styles.checkbox}
                  />
                  Enable Urgency Mode
                </label>
              </div>

              {hostSettings.urgency_enabled && (
                <div className={styles.parameterGrid}>
                  <ParameterSlider
                    label="Urgency Time Threshold"
                    value={hostSettings.urgency_time_left_seconds}
                    onChange={(value) =>
                      updateHostSetting("urgency_time_left_seconds", value)
                    }
                    min={15}
                    max={180}
                    unit="seconds"
                  />
                  <ParameterSlider
                    label="Urgency Hint Interval"
                    value={hostSettings.urgency_interval_seconds}
                    onChange={(value) =>
                      updateHostSetting("urgency_interval_seconds", value)
                    }
                    min={5}
                    max={60}
                    unit="seconds"
                  />
                </div>
              )}

              {hostSettings.urgency_enabled && (
                <div className={styles.urgencyDescription}>
                  <p>
                    When ≤{hostSettings.urgency_time_left_seconds}s remain in a round, hints
                    will be sent every {hostSettings.urgency_interval_seconds}s instead of
                    every {hostSettings.hint_interval_seconds}s.
                  </p>
                </div>
              )}
            </>
          )}

          {/* Accolade Presentation */}
          {hostSettings.enabled && (
            <>
              <div className={styles.toggleControl}>
                <label className={styles.toggleLabel}>
                  <input
                    type="checkbox"
                    checked={hostSettings.accolades_enabled}
                    onChange={(e) => updateHostSetting("accolades_enabled", e.target.checked)}
                    disabled={hostSettingsSaving}
                    className={styles.checkbox}
                  />
                  Enable Accolade Presentation
                </label>
              </div>

              {hostSettings.accolades_enabled && (
                <div className={styles.parameterGrid}>
                  <ParameterSlider
                    label="Num Accolades to Show"
                    value={hostSettings.num_accolades_to_show}
                    onChange={(value) => updateHostSetting("num_accolades_to_show", value)}
                    min={0}
                    max={10}
                    unit="accolades"
                    description="0 = show all accolades"
                  />
                  <ParameterSlider
                    label="Initial Delay"
                    value={hostSettings.accolade_initial_delay}
                    onChange={(value) => updateHostSetting("accolade_initial_delay", value)}
                    min={0}
                    max={5}
                    unit="seconds"
                  />
                  <ParameterSlider
                    label="Accolade Spacing"
                    value={hostSettings.accolade_spacing}
                    onChange={(value) => updateHostSetting("accolade_spacing", value)}
                    min={0.5}
                    max={10}
                    unit="seconds"
                  />
                </div>
              )}
            </>
          )}
        </CollapsibleSection>
      )}

      {/* Fuzzy Matching Configuration */}
      {fuzzyMatchConfig && (
        <CollapsibleSection
          title={
            <>
              Fuzzy Matching
              {fuzzyMatchLoading && <span className={styles.loadingBadge}>Loading...</span>}
            </>
          }
        >
          <div className={styles.fuzzyMatchDescription}>
            <p>
              Control how typos and variations are handled. Higher similarity scores are stricter.
            </p>
          </div>

          <div className={styles.parameterGrid}>
            <ParameterSlider
              label="Minimum Similarity (Acceptance)"
              value={fuzzyMatchConfig.min_similarity}
              onChange={(value) => updateFuzzyMatchSetting("min_similarity", value)}
              min={80}
              max={100}
              unit="%"
              description="Score required to accept typos (100 = exact match only)"
            />
            <ParameterSlider
              label="Near-Miss Threshold"
              value={fuzzyMatchConfig.near_miss_threshold}
              onChange={(value) => updateFuzzyMatchSetting("near_miss_threshold", value)}
              min={60}
              max={95}
              unit="%"
              description="Score to show 'close!' feedback"
            />
            <ParameterSlider
              label="Minimum Word Length"
              value={fuzzyMatchConfig.min_word_length}
              onChange={(value) => updateFuzzyMatchSetting("min_word_length", value)}
              min={3}
              max={10}
              unit="chars"
              description="Words shorter than this use exact matching"
            />
            <ParameterSlider
              label="Max Length Difference"
              value={fuzzyMatchConfig.max_length_diff}
              onChange={(value) => updateFuzzyMatchSetting("max_length_diff", value)}
              min={1}
              max={10}
              unit="chars"
              description="Max character difference for fuzzy match"
            />
          </div>

          <div className={styles.fuzzyMatchPresets}>
            <p className={styles.presetsLabel}>Quick Presets:</p>
            <div className={styles.presetButtons}>
              <button
                className={styles.presetButton}
                onClick={() => {
                  updateFuzzyMatchSetting("min_similarity", 100);
                }}
                disabled={fuzzyMatchSaving}
              >
                Strict (Exact Only)
              </button>
              <button
                className={styles.presetButton}
                onClick={() => {
                  updateFuzzyMatchSetting("min_similarity", 92);
                }}
                disabled={fuzzyMatchSaving}
              >
                Balanced (Default)
              </button>
              <button
                className={styles.presetButton}
                onClick={() => {
                  updateFuzzyMatchSetting("min_similarity", 85);
                }}
                disabled={fuzzyMatchSaving}
              >
                Forgiving
              </button>
            </div>
          </div>
        </CollapsibleSection>
      )}

      {/* Bot Stress Testing */}
      <CollapsibleSection title="Bot Stress Testing">
        <BotControls lobbyId={lobbyId} onBotsChanged={handleBotsChanged} hideTitle />
      </CollapsibleSection>

      {/* Sticky Action Bar */}
      <div className={styles.actionBar}>
        <div className={styles.actionBarInner}>
        <div className={styles.actionBarStatus}>
          <span
            className={styles.statusChip}
            style={{ "--status-color": getStatusColor(lobby.status) } as React.CSSProperties}
          >
            <span className={styles.statusDot} />
            {lobby.status}
          </span>
          <span className={styles.statusMeta}>
            {lobby.player_count} {lobby.player_count === 1 ? "player" : "players"}
          </span>
          {hasPending && (
            <span className={styles.pendingBadge} title="Changes apply on the next game (or a manual reset)">
              ⏳ {pendingLabel} pending
            </span>
          )}
        </div>

        <div className={styles.actionBarButtons}>
          <button
            className={styles.forceStartButton}
            onClick={handleForceStart}
            disabled={saving || forceStarting || !canForceStart}
            title={!canForceStart ? "Force start requires a WAITING gameroom with at least one player" : undefined}
          >
            {forceStarting ? "Starting..." : "Force Start"}
          </button>
          <button
            className={styles.forceResetButton}
            onClick={handleForceReset}
            disabled={saving}
            title={hasPending ? "Resets the game now and applies any pending changes" : "Resets the game now"}
          >
            Force Reset Now
          </button>
          <span className={styles.actionBarDivider} />
          <button
            className={styles.saveButton}
            onClick={() => handleSave("on_next_reset")}
            disabled={saving}
            title="Save changes; they apply when the current game ends or on a manual reset"
          >
            {saving ? "Saving..." : "Save (applies next game)"}
          </button>
          <button
            className={styles.saveNowButton}
            onClick={() => handleSave("immediate")}
            disabled={saving}
            title="Save changes and reset the game immediately"
          >
            Save & Reset Now
          </button>
        </div>
        </div>
      </div>

      <Toasts toasts={toasts} />
      {confirmDialog}
    </div>
  );
}

function CollapsibleSection({
  title,
  defaultOpen = false,
  headerExtra,
  children,
}: {
  title: React.ReactNode;
  defaultOpen?: boolean;
  headerExtra?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeaderRow}>
        <button
          type="button"
          className={styles.sectionToggle}
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
        >
          <ChevronDown
            size={18}
            className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}
          />
          <span className={styles.sectionTitle}>{title}</span>
        </button>
        {headerExtra && open && (
          <div className={styles.sectionHeaderExtra}>{headerExtra}</div>
        )}
      </div>
      {open && <div className={styles.sectionBody}>{children}</div>}
    </div>
  );
}

function getStatusColor(status: string) {
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
}

function ParameterSlider({
  label,
  value,
  onChange,
  min,
  max,
  unit,
  description,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  unit: string;
  description?: string;
}) {
  const [draft, setDraft] = useState(String(value));

  const commit = () => {
    const v = Number(draft);
    if (!isNaN(v) && draft.trim() !== "") {
      const clamped = Math.min(max, Math.max(min, v));
      setDraft(String(clamped));
      onChange(clamped);
    } else {
      // Reset to last committed value
      setDraft(String(value));
    }
  };

  return (
    <div className={styles.parameterControl}>
      <div className={styles.parameterHeader}>
        <label className={styles.parameterLabel}>{label}</label>
        <span className={styles.parameterUnit}>{unit}</span>
      </div>
      {description && (
        <p className={styles.parameterDescription}>{description}</p>
      )}
      <input
        type="number"
        className={styles.parameterInput}
        value={draft}
        min={min}
        max={max}
        onChange={(e) => {
          // Local-only — no API call until blur/enter
          setDraft(e.target.value);
        }}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
      />
    </div>
  );
}
