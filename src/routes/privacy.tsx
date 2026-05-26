import { createFileRoute } from "@tanstack/react-router";
import PrivacyPage from "@/app/privacy/page";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
});
