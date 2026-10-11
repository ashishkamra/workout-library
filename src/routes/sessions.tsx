import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SessionsPage } from "@/components/sessions-page";

export const Route = createFileRoute("/sessions")({
  component: Sessions,
});

function Sessions() {
  const navigate = useNavigate();
  return (
    <SessionsPage
      onOpen={(id) => {
        void navigate({ to: "/library/$id", params: { id } });
      }}
    />
  );
}
