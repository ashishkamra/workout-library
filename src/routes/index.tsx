import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LibraryHome } from "@/components/library-home";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  return (
    <LibraryHome
      onOpen={(id) => {
        void navigate({ to: "/library/$id", params: { id } });
      }}
    />
  );
}
