"use client";
import { useSyncExternalStore } from "react";
import { subscribe, getMode } from "./quality";

/* React-Anbindung des Lite-Mode (animation-performance §6.2) */
export const useMotionMode = () => useSyncExternalStore(subscribe, getMode, () => "full" as const);
