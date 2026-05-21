import type React from "react";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useUser } from "@/hooks/useUser";
import AdminNav from "./AdminNav";
import SynthwaveBackground from "@/components/synthwave-background";
import styles from "./layout.module.css";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate({ to: "/login" });
      return;
    }

    if (user.app_metadata?.role !== "admin") {
      navigate({ to: "/" });
    }
  }, [user, loading, navigate]);

  if (loading || !user || user.app_metadata?.role !== "admin") {
    return null;
  }

  return (
    <div className={styles.container}>
      <SynthwaveBackground />
      <AdminNav />
      <main className={styles.mainContent}>{children}</main>
    </div>
  );
}
