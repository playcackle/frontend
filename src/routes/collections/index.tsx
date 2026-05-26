import { createFileRoute } from "@tanstack/react-router";
import CollectionsPage from "@/app/collections/page";

export const Route = createFileRoute("/collections/")({
  component: CollectionsPage,
});
