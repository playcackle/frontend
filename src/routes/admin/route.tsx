import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useUser } from "@/hooks/useUser";
import AdminNav from "@/app/admin/AdminNav";
import SynthwaveBackground from "@/components/synthwave-background";
import styles from "@/app/admin/layout.module.css";
import { useEffect } from "react";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
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
      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
}
