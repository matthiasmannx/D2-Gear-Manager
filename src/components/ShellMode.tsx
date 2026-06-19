"use client";

import { useEffect } from "react";

export default function ShellMode() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const appShell = params.get("app");

    if (appShell) {
      document.documentElement.dataset.appShell = appShell;
      document.body.dataset.appShell = appShell;
      return () => {
        delete document.documentElement.dataset.appShell;
        delete document.body.dataset.appShell;
      };
    }
  }, []);

  return null;
}
