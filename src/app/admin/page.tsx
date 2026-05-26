import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";

export default function AdminPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to collections by default
    navigate({ to: "/admin/collections", replace: true });
  }, [navigate]);

  return (
    <div style={{ padding: "2rem", color: "white", fontFamily: "Orbitron" }}>
      <p>Redirecting to Collections...</p>
    </div>
  );
}
