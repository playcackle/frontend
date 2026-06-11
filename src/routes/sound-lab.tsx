import { createFileRoute } from "@tanstack/react-router";
import SoundLabPage from "@/app/sound-lab/page";

export const Route = createFileRoute("/sound-lab")({
  component: SoundLabPage,
});
