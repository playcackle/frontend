import { createFileRoute } from "@tanstack/react-router";
import LobbyDetailPage from "@/app/admin/lobbies/[id]/page";

export const Route = createFileRoute("/admin/lobbies/$id")({
  component: function LobbyDetailRoute() {
    const { id } = Route.useParams();
    return <LobbyDetailPage id={id} />;
  },
});
