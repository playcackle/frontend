import { createFileRoute } from "@tanstack/react-router";
import StatsDemo from "@/app/stats-demo/page";

export const Route = createFileRoute("/stats-demo")({
  component: StatsDemo,
});
