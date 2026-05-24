import { createFileRoute } from "@tanstack/react-router";
import AccoladesDemoPage from "@/app/accolades-demo/page";

export const Route = createFileRoute("/accolades-demo")({
  component: AccoladesDemoPage,
});
