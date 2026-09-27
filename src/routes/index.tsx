import { createFileRoute } from "@tanstack/react-router";
import { a } from "../shared/a";

export const Route = createFileRoute("/")({
  component: () => <p>{a()}</p>,
});
