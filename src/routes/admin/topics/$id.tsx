import { createFileRoute } from "@tanstack/react-router";
import TopicDetailPage from "@/app/admin/topics/[id]/page";

export const Route = createFileRoute("/admin/topics/$id")({
  component: function TopicDetailRoute() {
    const { id } = Route.useParams();
    return <TopicDetailPage id={id} />;
  },
});
