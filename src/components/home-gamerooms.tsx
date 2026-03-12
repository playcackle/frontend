"use client";

import GameroomTile from "@/components/gameroom-tile";
import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "@/app/page.module.css";

type LobbyInfo = {
  lobby_id: string;
  collection_name: string;
  status: string;
  player_count: number;
  join_base_url?: string | null;
  game_ws_url?: string | null;
  chat_ws_url?: string | null;
};

type Props = { initialGamerooms: LobbyInfo[] };

const PREVIEW_COUNT = 4;
const POLL_INTERVAL_MS = 20_000;

async function fetchGamerooms(): Promise<LobbyInfo[]> {
  const baseUrl = process.env.NEXT_PUBLIC_LOBBY_MANAGER_URL;
  if (!baseUrl) return [];
  const res = await fetch(`${baseUrl}/lobbies`);
  if (!res.ok) return [];
  return res.json();
}

export default function HomeGamerooms({ initialGamerooms }: Props) {
  const [gamerooms, setGamerooms] = useState<LobbyInfo[]>(initialGamerooms);

  useEffect(() => {
    const interval = setInterval(async () => {
      const updated = await fetchGamerooms();
      setGamerooms(updated);
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  const preview = gamerooms.slice(0, PREVIEW_COUNT);

  if (gamerooms.length === 0) {
    return (
      <div className={styles.gameroomsEmpty}>
        <p>No game rooms available right now. Check back soon!</p>
      </div>
    );
  }

  return (
    <div className={styles.gameroomsSection}>
      <div className={styles.gameroomsGrid}>
        {preview.map((room) => (
          <GameroomTile key={room.lobby_id} gameroom={room} />
        ))}
      </div>

      {gamerooms.length > PREVIEW_COUNT && (
        <div className={styles.gameroomsFooter}>
          <Link href="/gamerooms" className={styles.browseAllBtn}>
            Browse All {gamerooms.length} Rooms
          </Link>
        </div>
      )}
    </div>
  );
}
