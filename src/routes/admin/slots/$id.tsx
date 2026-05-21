import { createFileRoute } from "@tanstack/react-router";
import SlotDetailPage from "@/app/admin/slots/[id]/page";

export const Route = createFileRoute("/admin/slots/$id")({
  component: function SlotDetailRoute() {
    const { id } = Route.useParams();
    return <SlotDetailPage id={id} />;
  },
});
