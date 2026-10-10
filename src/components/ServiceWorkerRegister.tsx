"use client";

import { useEffect } from "react";

const isLocalhost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

/**
 * Registra o service worker em producao. Em localhost (desenvolvimento) remove
 * registros antigos, para que nunca seja exibida uma versao obsoleta da pagina.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;

    const handleLoad = () => {
      if (isLocalhost) {
        navigator.serviceWorker
          .getRegistrations()
          .then((registrations) => {
            for (const registration of registrations) {
              void registration.unregister();
            }
          })
          .catch(() => undefined);
        return;
      }
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* Falha silenciosa: o app continua funcionando sem cache offline. */
      });
    };
    if (document.readyState === "complete") handleLoad();
    else window.addEventListener("load", handleLoad);
    return () => window.removeEventListener("load", handleLoad);
  }, []);

  return null;
}
