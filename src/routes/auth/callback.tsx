import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createClient } from "@/lib/supabase/client";
import { useEffect } from "react";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallback,
});

function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      const redirectTo = url.searchParams.get("redirect_to") || url.searchParams.get("next") || "/";
      const safeRedirect = redirectTo.startsWith("/") ? redirectTo : "/";

      if (!code) {
        navigate({
          to: "/login",
          search: {
            error: "missing_code",
            error_description: "Unable to complete sign-in. Please request a new link.",
          },
        });
        return;
      }

      const supabase = createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        navigate({
          to: "/login",
          search: {
            error: "callback_error",
            error_description: error.message,
          },
        });
        return;
      }

      navigate({ to: safeRedirect });
    };

    handleCallback();
  }, [navigate]);

  return <div>Completing sign-in...</div>;
}
