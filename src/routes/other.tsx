import { createFileRoute } from "@tanstack/react-router";
import { b } from "../shared/b";

export const Route = createFileRoute("/other")({
  component: () => <p>{b()}</p>,
});
