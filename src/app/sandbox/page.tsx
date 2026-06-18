import { redirect } from "next/navigation";

// Buffs & Nerfs is samengevoegd met de Changelog — oude links doorsturen.
export default function SandboxPage() {
  redirect("/changelog");
}
