import { createFileRoute } from "@tanstack/react-router";
import ProfilePage from "@/app/profile/page";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});
