import { AuthButtons } from "@/components/auth-buttons";
import HomeGamerooms from "@/components/home-gamerooms";
import HomeUserStats from "@/components/home-user-stats";
import OnboardingModal from "@/components/onboarding-modal";
import PreLaunchCta from "@/components/pre-launch-cta";
import SettingsControls from "@/components/settings-controls";
import { useUser } from "@/hooks/useUser";
import { Link, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import HomeLeaderboard from "../components/home-leaderboard";
import styles from "./page.module.css";

type LobbyInfo = {
  lobby_id: string;
  collection_name: string;
  status: string;
  player_count: number;
  join_base_url?: string | null;
  game_ws_url?: string | null;
  chat_ws_url?: string | null;
};

export default function Home() {
  const { user, loading: authLoading } = useUser();
  const search = useSearch({ strict: false });
  const [gamerooms, setGamerooms] = useState<LobbyInfo[]>([]);

  const isLaunched = import.meta.env.VITE_LAUNCHED === "true";

  const authError = (search as Record<string, string | undefined>).error;
  const errorDescription = (search as Record<string, string | undefined>)
    .error_description;
  const showOnboarding =
    (search as Record<string, string | undefined>).onboarding === "1";

  useEffect(() => {
    const baseUrl = import.meta.env.VITE_LOBBY_MANAGER_URL;
    if (!baseUrl) return;

    fetch(`${baseUrl}/lobbies`)
      .then((res) => {
        if (!res.ok) throw new Error(`Error fetching lobbies: ${res.status}`);
        return res.json();
      })
      .then(setGamerooms)
      .catch((err) => console.error("Failed to fetch lobbies:", err));
  }, []);

  if (authLoading) return null;

  return (
    <>
      <SettingsControls musicSrc="/audio/05 Hold.m4a" musicStartAt={3} />
      {showOnboarding && <OnboardingModal show={showOnboarding} />}

      <div className={styles.pageWrapper}>
        {/* Hero */}
        <section className={styles.heroSection}>
          <h1 className={styles.title}>
            <span className={styles.neonText}>CAC</span>
            <span className={styles.neonTextPink}>KLE</span>
          </h1>
          <p className={styles.tagline}>
            Welcome to Cackle - trivia reinvented! Jump into a game room and get
            started
          </p>

          {authError && (
            <div className={styles.authErrorBanner}>
              <span className={styles.authErrorIcon}>!</span>
              <div>
                <strong>Email Link Expired</strong>
                <p>
                  {errorDescription?.replace(/\+/g, " ") ||
                    "Your email confirmation link has expired."}
                </p>
                <p>
                  <Link to="/register" className={styles.authErrorLink}>
                    Sign up again
                  </Link>{" "}
                  or{" "}
                  <Link to="/login" className={styles.authErrorLink}>
                    try logging in
                  </Link>
                  .
                </p>
              </div>
            </div>
          )}
        </section>

        {!isLaunched ? (
          <section className={styles.authSection}>
            <PreLaunchCta />
          </section>
        ) : user ? (
          <div className={styles.twoColLayout}>
            {/* Left column: Gamerooms */}
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  <span className={styles.sectionTitleAccent}>Game</span> Rooms
                </h2>
                <Link to="/gamerooms" className={styles.seeAllLink}>
                  Browse All
                </Link>
              </div>
              <HomeGamerooms initialGamerooms={gamerooms} />
            </section>

            {/* Right column: Stats + Leaderboard stacked */}
            <div className={styles.rightCol}>
              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>
                    <span className={styles.sectionTitleAccent}>Your</span>{" "}
                    Stats
                  </h2>
                  <Link to="/profile" className={styles.seeAllLink}>
                    Full Profile
                  </Link>
                </div>
                <HomeUserStats userId={user.id} />
              </section>

              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>
                    <span className={styles.sectionTitleAccent}>Global</span>{" "}
                    Leaderboard
                  </h2>
                  <Link to="/leaderboard" className={styles.seeAllLink}>
                    See All
                  </Link>
                </div>
                <HomeLeaderboard />
              </section>
            </div>
          </div>
        ) : (
          <section className={styles.authSection}>
            <AuthButtons />
          </section>
        )}
      </div>
    </>
  );
}
