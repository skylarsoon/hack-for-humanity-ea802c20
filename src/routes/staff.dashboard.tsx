import { createFileRoute } from "@tanstack/react-router";
import { StaffDashboard } from "@/components/nido/StaffDashboard";
import { StaffGate } from "@/components/nido/StaffGate";

export const Route = createFileRoute("/staff/dashboard")({
  head: () => ({ meta: [
    { title: "Coordinator dashboard · Nido Abierto" },
    { name: "description", content: "Nido Abierto coordinator view of purchases, families, needs and documents." },
    { property: "og:title", content: "Coordinator dashboard · Nido Abierto" },
    { property: "og:description", content: "Purchases, household needs, field updates and blog review for Nido Abierto coordinators." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  component: () => <StaffGate><StaffDashboard /></StaffGate>,
});
