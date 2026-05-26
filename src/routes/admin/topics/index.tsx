import { createFileRoute } from "@tanstack/react-router";
import TopicsPage from "@/app/admin/topics/page";

export const Route = createFileRoute("/admin/topics/")({
  component: TopicsPage,
});
