import type { Metadata } from "next";
import { HistoryView } from "@/components/HistoryView";

export const metadata: Metadata = {
  title: "Historico - FotoCaloria",
  description: "Refeicoes salvas neste dispositivo e o total diario.",
};

export default function HistoryPage() {
  return <HistoryView />;
}
