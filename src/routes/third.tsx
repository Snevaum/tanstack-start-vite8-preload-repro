import { createFileRoute } from "@tanstack/react-router";
import { a } from "../shared/a";

export const Route = createFileRoute("/third")({
  component: () => <p>third: {a()}</p>,
});
