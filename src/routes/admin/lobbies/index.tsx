import { createFileRoute } from "@tanstack/react-router";
import LobbiesPage from "@/app/admin/lobbies/page";

export const Route = createFileRoute("/admin/lobbies/")({
  component: LobbiesPage,
});
