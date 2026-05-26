import { createFileRoute } from "@tanstack/react-router";
import CollectionEditPage from "@/app/collections/[id]/edit/page";

export const Route = createFileRoute("/collections/$id/edit")({
  component: CollectionEditWrapper,
});

function CollectionEditWrapper() {
  const { id } = Route.useParams();
  return <CollectionEditPage id={id} />;
}
