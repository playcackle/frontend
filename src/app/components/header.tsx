"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import styles from "./header.module.css";

export default function Header() {
  const { data, status } = useSession();
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <Link href="/">
          <span className={styles.logoText}>
            SNAP<span className={styles.logoHighlight}>SCORE</span>
          </span>
        </Link>
      </div>
      <nav className={styles.nav}>
        {/* <ul className={styles.navList}>
          <li>
            <Link href="/about" className={styles.navLink}>
              About
            </Link>
          </li>
          <li>
            <Link href="/leaderboard" className={styles.navLink}>
              Leaderboard
            </Link>
          </li>
        </ul> */}
      </nav>
      <div className={styles.auth}>
        {status === "authenticated" && (
          <div className={styles.playerName}>{data.user?.name}</div>
        )}
        {status === "unauthenticated" && (
          <>
            <Link href="/login" className={styles.loginLink}>
              Login
            </Link>
            <Link href="/register" className={styles.registerLink}>
              Register
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
