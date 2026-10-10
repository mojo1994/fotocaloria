import type { Metadata } from "next";
import { HistoryView } from "@/components/HistoryView";

export const metadata: Metadata = {
  title: "Histórico - FotoCaloria",
  description: "Refeições salvas neste dispositivo e o total diário.",
};

export default function HistoryPage() {
  return <HistoryView />;
}
