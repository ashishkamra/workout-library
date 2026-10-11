import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ExercisePage } from "@/components/exercise-page";

export const Route = createFileRoute("/library_/$id")({
  component: ExerciseDetail,
});

function ExerciseDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  return <ExercisePage id={id} onBack={() => void navigate({ to: "/" })} />;
}
