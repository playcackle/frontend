import { createFileRoute } from "@tanstack/react-router";
import GameroomsClient from "@/app/gamerooms/gamerooms-client";

export const Route = createFileRoute("/gamerooms")({
  component: GameroomsClient,
});
