import { useLocation, useNavigate } from "@tanstack/react-router";
import styles from "./layout.module.css";

const navItems = [
  { path: "/admin/collections", label: "COLLECTIONS" },
  { path: "/admin/topics", label: "TOPICS" },
  { path: "/admin/lobbies", label: "GAMEROOMS" },
];

export default function AdminNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className={styles.tabNav}>
      {navItems.map((item) => (
        <button
          key={item.path}
          className={`${styles.tab} ${location.pathname.startsWith(item.path) ? styles.active : ""}`}
          onClick={() => navigate({ to: item.path })}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}
