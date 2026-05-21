import { createFileRoute } from "@tanstack/react-router";
import LoginPage from "@/app/login/page";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  validateSearch: (search: Record<string, unknown>): { error?: string; error_description?: string } => ({
    error: (search.error as string) || undefined,
    error_description: (search.error_description as string) || undefined,
  }),
});
