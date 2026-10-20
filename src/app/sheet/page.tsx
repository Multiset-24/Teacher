import type { Metadata } from "next";
import { Sheet } from "@/components/sheet/Sheet";
import { canonical } from "@/lib/site";

export const metadata: Metadata = {
  title: "Interview sheet",
  description: "150 interview problems grouped by pattern, with LeetCode links, matching lessons, and a checklist saved to your account.",
  alternates: canonical("/sheet"),
};

export default function SheetPage() {
  return <Sheet />;
}
