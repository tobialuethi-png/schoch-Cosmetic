"use client";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import MotionScope from "./MotionScope";

/* Ein Motion-Runner pro Route (Main + Footer); key=pathname baut die Trigger beim Wechsel sauber neu auf */
export default function PageMotion({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return <MotionScope key={pathname} className="contents">{children}</MotionScope>;
}
