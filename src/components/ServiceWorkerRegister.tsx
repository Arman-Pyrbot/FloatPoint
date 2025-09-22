"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      const register = async () => {
        try {
          const reg = await navigator.serviceWorker.register("/service-worker.js");
          console.log("✅ Service Worker registered:", reg.scope);
        } catch (err) {
          console.log("❌ Service Worker failed:", err);
        }
      };
      register();
    }
  }, []);

  return null;
}
