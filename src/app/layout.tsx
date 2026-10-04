import type { Metadata, Viewport } from "next";
import { Lilita_One, Nunito } from "next/font/google";
import type { ReactNode } from "react";
import { AZUL_HEROE } from "@/styles/colores-marca";
import "@/styles/tokens.css";
import "@/styles/base.css";

const lilita = Lilita_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-lilita",
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Heroes IA", template: "%s · Heroes IA" },
  description:
    "La red privada de amigos para aprender IA compartiendo skills, repos, noticias, oportunidades y proyectos.",
  applicationName: "Heroes IA",
  appleWebApp: { capable: true, title: "Heroes IA", statusBarStyle: "black-translucent" },
  // App privada: que no la indexen los buscadores.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: AZUL_HEROE,
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="es-AR" className={`${lilita.variable} ${nunito.variable}`}>
      <body>{children}</body>
    </html>
  );
}
