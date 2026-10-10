import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import { CameraIcon } from "@/components/icons";
import { PlanBadge } from "@/components/PlanBadge";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "FotoCaloria",
  description:
    "Fotografe sua refeição e receba uma estimativa transparente de calorias e macronutrientes.",
  applicationName: "FotoCaloria",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "FotoCaloria",
    statusBarStyle: "default",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#065f46",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-xl focus:bg-brand-800 focus:px-4 focus:py-2 focus:text-white"
        >
          Pular para o conteúdo principal
        </a>

        <header className="sticky top-0 z-40 border-b border-brand-100 bg-white/85 backdrop-blur">
          <div className="relative mx-auto flex max-w-4xl items-center justify-center gap-4 px-4 py-3">
            <Link href="/" className="flex items-center gap-3 rounded-2xl">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-700 text-white shadow-md shadow-brand-700/20">
                <CameraIcon width={24} height={24} />
              </span>
              <span className="text-2xl font-extrabold tracking-tight text-brand-900">
                FotoCaloria
              </span>
            </Link>

            <div className="absolute right-4 flex items-center gap-2">
              <PlanBadge />
            </div>
          </div>
        </header>

        <main id="conteudo" className="mx-auto max-w-4xl px-4 py-8">
          {children}
        </main>

        <footer className="mx-auto max-w-4xl px-4 pb-10 pt-4 text-sm text-brand-700">
          <div className="rounded-3xl border border-brand-100 bg-white/70 p-5">
            <p>
              As estimativas são aproximadas e não substituem avaliação profissional. O histórico
              fica salvo apenas neste dispositivo e pode não sincronizar entre aparelhos.
            </p>
          </div>
        </footer>

        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
