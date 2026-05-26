import { createFileRoute } from "@tanstack/react-router";
import HomePage from "@/app/page";

type HomeSearch = {
  error?: string;
  error_description?: string;
  onboarding?: string;
};

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): HomeSearch => ({
    error: search.error as string | undefined,
    error_description: search.error_description as string | undefined,
    onboarding: search.onboarding as string | undefined,
  }),
  component: HomePage,
});
