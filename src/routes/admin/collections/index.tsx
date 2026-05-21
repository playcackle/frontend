import { createFileRoute } from "@tanstack/react-router";
import CollectionsPage from "@/app/admin/collections/page";

export const Route = createFileRoute("/admin/collections/")({
  component: CollectionsPage,
});
