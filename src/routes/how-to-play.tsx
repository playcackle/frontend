import { createFileRoute } from "@tanstack/react-router";
import HowToPlayPage from "@/app/how-to-play/page";

export const Route = createFileRoute("/how-to-play")({
  component: HowToPlayPage,
});
