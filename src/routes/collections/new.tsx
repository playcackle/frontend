import { createFileRoute } from "@tanstack/react-router";
import CollectionNewPage from "@/app/collections/new/page";

export const Route = createFileRoute("/collections/new")({
  component: CollectionNewPage,
});
