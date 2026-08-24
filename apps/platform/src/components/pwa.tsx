"use client";

import { useEffect } from "react";

export function Pwa() {
  useEffect(() => {
    document.documentElement.classList.add("powerchain-app");
  }, []);
  return null;
}
