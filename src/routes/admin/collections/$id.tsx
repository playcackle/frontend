import { createFileRoute } from "@tanstack/react-router";
import CollectionDetailPage from "@/app/admin/collections/[id]/page";

export const Route = createFileRoute("/admin/collections/$id")({
  component: function CollectionDetailRoute() {
    const { id } = Route.useParams();
    return <CollectionDetailPage id={id} />;
  },
});
