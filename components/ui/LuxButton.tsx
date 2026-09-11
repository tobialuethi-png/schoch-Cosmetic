"use client";
import type { ComponentProps, ReactNode } from "react";
import { TransitionLink } from "@/components/motion/Transition";
import { ArrowRight } from "@/components/ui/Icons";

/**
 * Primär-CTA der Seite (eine Familie, drei Flächen):
 *  default  Cocoa-Verlauf, Creme-Text, orange Pfeil-Scheibe — auf hellen Flächen
 *  cream    Creme, Ink-Text, orange Scheibe — auf dem orangen Schluss-Block
 *  night    Creme, Ink-Text, Cocoa-Scheibe — auf dunklen Flächen (derzeit ohne Verwendung)
 * Interne Links laufen über TransitionLink, externe/tel über <a>, Formulare über <button>.
 */
type Tone = "default" | "cream" | "night";
type Base = { tone?: Tone; className?: string; children: ReactNode };
type LinkProps = Base & { href: string; type?: never; external?: boolean } & Omit<ComponentProps<"a">, "href" | "children" | "className">;
type ButtonProps = Base & { href?: never; type: "submit" | "button"; disabled?: boolean; "aria-busy"?: boolean };

const toneClass: Record<Tone, string> = { default: "", cream: "btn-lux--cream", night: "btn-lux--night" };

function Inner({ children }: { children: ReactNode }) {
  return (
    <>
      <span className="shine" aria-hidden="true" />
      {children}
      <span className="disc" aria-hidden="true"><ArrowRight /><ArrowRight /></span>
    </>
  );
}

export default function LuxButton(props: LinkProps | ButtonProps) {
  const cls = `btn-lux ${toneClass[props.tone ?? "default"]} ${props.className ?? ""}`.trim();
  if (props.href === undefined) {
    const { tone: _t, className: _c, children, ...rest } = props as ButtonProps;
    return <button className={cls} {...rest}><Inner>{children}</Inner></button>;
  }
  const { tone: _t, className: _c, children, href, external, ...rest } = props as LinkProps;
  if (external || !href.startsWith("/")) {
    return <a href={href} className={cls} {...rest}><Inner>{children}</Inner></a>;
  }
  return <TransitionLink href={href} className={cls} {...(rest as Omit<ComponentProps<typeof TransitionLink>, "href" | "children" | "className">)}><Inner>{children}</Inner></TransitionLink>;
}
