"use client";

import { createClient } from "@/lib/supabase/client";
import type { User, AuthChangeEvent, Session } from "@supabase/supabase-js";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!isMounted) return;

      if (error) {
        setUser(null);
      } else {
        setUser(data.user);
      }
      setLoading(false);
    };

    loadUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      if (!isMounted) return;

      // INITIAL_SESSION fires on page load when restoring an existing session.
      // Do NOT call router.refresh() here — it causes a full Server Component re-fetch
      // and re-paints the LCP element, adding ~3800ms to the LCP timestamp.
      // Initial user state is set by the explicit loadUser() call above.
      if (event === 'INITIAL_SESSION') {
        return;
      }

      setUser(session?.user ?? null);
      setLoading(false);

      // Only refresh on explicit user-initiated events (login / logout)
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        router.refresh();
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  return { user, loading };
}
