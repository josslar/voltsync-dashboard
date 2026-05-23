import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAuth } from "@/store/auth";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const email = useAuth((s) => s.email);
  return <Navigate to={email ? "/dashboard" : "/login"} />;
}
