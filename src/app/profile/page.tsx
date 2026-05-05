"use client";

import { useUser } from "@/hooks/useUser";
import { useEffect, useState, useCallback } from "react";
import {
  playersApi,
  type PlayerAccoladeStats,
  type PlayerPlaystyleProfile,
  type PlayerProfileStats,
} from "@/lib/api/players";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./page.module.css";
import { EMPTY_PLAYSTYLE_PROFILE } from "./playstyle";

function StatCard({ value, label, accent = "pink" }: { value: string; label: string; accent?: "pink" | "blue" | "gold" }) {
  return (
    <div className={`${styles.statCard} ${styles[`accent_${accent}`]}`}>
      <div className={styles.statValue}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  );
}

function SpotlightCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className={styles.spotlightCard}>
      <div className={styles.spotlightLabel}>{label}</div>
      <div className={styles.spotlightValue}>{value}</div>
      {hint ? <div className={styles.spotlightHint}>{hint}</div> : null}
    </div>
  );
}

function AccoladeChip({ label, count }: { label: string; count: number }) {
  return (
    <div className={styles.accoladeStatChip}>
      <span className={styles.accoladeStatLabel}>{label}</span>
      <span className={styles.accoladeStatCount}>×{count}</span>
    </div>
  );
}

function PlaystyleRadar({
  dimensions,
}: {
  dimensions: Array<{ key: string; label: string; normalized: number; raw: number }>;
}) {
  const width = 340;
  const height = 300;
  const centerX = width / 2;
  const centerY = 136;
  const radius = 116;
  const labelRadius = 132;
  const levels = 4;

  const getPoint = (index: number, value: number, customRadius?: number) => {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / dimensions.length;
    const distance = customRadius ?? (value / 100) * radius;
    return {
      x: centerX + Math.cos(angle) * distance,
      y: centerY + Math.sin(angle) * distance,
    };
  };

  const polygonPoints = dimensions
    .map((dimension, index) => {
      const point = getPoint(index, dimension.normalized);
      return `${point.x},${point.y}`;
    })
    .join(" ");

  return (
    <div className={styles.radarWrap}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className={styles.radarChart}
        role="img"
        aria-label="Playstyle radar chart"
      >
        {Array.from({ length: levels }).map((_, levelIndex) => {
          const levelValue = ((levelIndex + 1) / levels) * 100;
          const ringPoints = dimensions
            .map((_, index) => {
              const point = getPoint(index, levelValue);
              return `${point.x},${point.y}`;
            })
            .join(" ");

          return (
            <polygon
              key={levelValue}
              points={ringPoints}
              className={styles.radarRing}
            />
          );
        })}

        {dimensions.map((dimension, index) => {
          const outer = getPoint(index, 100);
          return (
            <line
              key={dimension.key}
              x1={centerX}
              y1={centerY}
              x2={outer.x}
              y2={outer.y}
              className={styles.radarAxis}
            />
          );
        })}

        <polygon points={polygonPoints} className={styles.radarArea} />

        {dimensions.map((dimension, index) => {
          const point = getPoint(index, dimension.normalized);
          return (
            <circle
              key={dimension.key}
              cx={point.x}
              cy={point.y}
              r="4"
              className={styles.radarDot}
            />
          );
        })}

        {dimensions.map((dimension, index) => {
          const labelPoint = getPoint(index, 100, labelRadius);
          const isLeft = labelPoint.x < centerX - 12;
          const isRight = labelPoint.x > centerX + 12;
          const anchor = isLeft ? "end" : isRight ? "start" : "middle";

          return (
            <text
              key={`${dimension.key}-label`}
              x={labelPoint.x}
              y={labelPoint.y}
              textAnchor={anchor}
              dominantBaseline="middle"
              className={styles.radarLabel}
            >
              {dimension.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useUser();
  const router = useRouter();
  const [profile, setProfile] = useState<PlayerProfileStats | null>(null);
  const [playstyle, setPlaystyle] = useState<PlayerPlaystyleProfile | null>(null);
  const [accoladeStats, setAccoladeStats] = useState<PlayerAccoladeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setError(null);
      const [profileData, playstyleData, accoladeStatsData] = await Promise.all([
        playersApi.getProfile(user.id),
        playersApi.getPlaystyle(user.id),
        playersApi.getAccoladeStats(user.id),
      ]);
      setProfile(profileData);
      setPlaystyle(playstyleData);
      setAccoladeStats(accoladeStatsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (user?.id) loadProfile();
  }, [authLoading, user?.id, router, loadProfile]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.stateContainer}>
          <div className={styles.spinner} />
          <p className={styles.stateText}>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className={styles.container}>
        <div className={styles.stateContainer}>
          <p className={styles.errorHeading}>Failed to load profile</p>
          <p className={styles.stateText}>{error}</p>
          <button className={styles.retryButton} onClick={loadProfile}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const resolvedPlaystyle: PlayerPlaystyleProfile =
    playstyle ?? EMPTY_PLAYSTYLE_PROFILE;

  const topAccolades = (accoladeStats?.accolades_by_type ?? []).slice(0, 3);

  return (
    <div className={styles.container}>

      {/* Player profile card */}
      <section className={styles.profileCard}>
        <div className={styles.profileCardHeader}>
          <h1 className={styles.playerName}>{profile.name}</h1>
          <p className={styles.heroSub}>Joined {formatDate(profile.created_at)}</p>
        </div>

        <div className={styles.profileCardBody}>
          <div className={styles.profileInfoColumn}>
            <div className={styles.profileIdentity}>
              {profile.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={`${profile.name}'s avatar`}
                  width={72}
                  height={72}
                  className={styles.avatar}
                />
              ) : (
                <div className={styles.avatar}>
                  {(profile.name || "?")[0].toUpperCase()}
                </div>
              )}
              <div className={styles.heroMeta}>
                <div className={styles.playstyleIdentityBlock}>
                  <h2 className={styles.playstyleTitle}>{resolvedPlaystyle.archetype}</h2>
                  <p className={styles.playstyleSummary}>{resolvedPlaystyle.summary}</p>
                </div>
                <div className={styles.profileBadges}>
                  <span className={styles.playstyleBadge}>{resolvedPlaystyle.total_accolades} total accolades</span>
                  {resolvedPlaystyle.top_traits.length > 0 && (
                    <span className={styles.playstyleBadge}>
                      {resolvedPlaystyle.top_traits.join(" + ")}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <PlaystyleRadar dimensions={resolvedPlaystyle.dimensions} />
        </div>
      </section>

      {/* Core stats */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Core Stats</h2>
        <div className={styles.statsGrid}>
          <StatCard value={profile.total_score.toLocaleString()} label="Total Score" accent="pink" />
          <StatCard value={String(profile.games_played)} label="Games Played" accent="blue" />
          <StatCard value={profile.overall_accuracy !== null ? `${profile.overall_accuracy.toFixed(1)}%` : "—"} label="Accuracy" accent="blue" />
          <StatCard value={profile.average_score_per_game.toFixed(1)} label="Score / Game" accent="blue" />
          <StatCard value={String(resolvedPlaystyle.total_accolades)} label="Total Accolades" accent="gold" />
          <StatCard value={String(profile.total_slots_snapped)} label="Slots Snapped" accent="gold" />
        </div>
      </section>

      {/* Playstyle highlights */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Playstyle Highlights</h2>
        <div className={styles.spotlightGrid}>
          <SpotlightCard
            label="Archetype"
            value={resolvedPlaystyle.archetype}
            hint={resolvedPlaystyle.summary}
          />
          <SpotlightCard
            label="Strongest Trait"
            value={resolvedPlaystyle.top_traits[0] ?? "Still emerging"}
            hint={resolvedPlaystyle.top_traits[1] ? `Backed by ${resolvedPlaystyle.top_traits[1]}` : "Play more to sharpen your profile"}
          />
        </div>
      </section>

      {/* Signature accolades */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Signature Accolades</h2>
        {topAccolades.length > 0 ? (
          <div className={styles.accoladeStatsRow}>
            {topAccolades.map((accolade) => (
              <AccoladeChip
                key={accolade.accolade_type}
                label={accolade.accolade_type.replaceAll("_", " ")}
                count={accolade.count}
              />
            ))}
          </div>
        ) : (
          <div className={styles.emptyPanel}>
            Play a few rounds to start building a signature accolade collection.
          </div>
        )}
      </section>


    </div>
  );
}
