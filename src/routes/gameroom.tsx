import { createFileRoute } from "@tanstack/react-router";
import GameroomPage from "@/app/gameroom/page";

export const Route = createFileRoute("/gameroom")({
  component: GameroomPage,
});
