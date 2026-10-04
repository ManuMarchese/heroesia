import type { MetadataRoute } from "next";
import { AZUL_HEROE } from "@/styles/colores-marca";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Heroes IA",
    short_name: "Heroes IA",
    description:
      "La red privada de amigos para aprender IA compartiendo skills, repos, noticias, oportunidades y proyectos.",
    lang: "es-AR",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: AZUL_HEROE,
    theme_color: AZUL_HEROE,
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      // El dibujo cabe en la zona segura central, así que el mismo archivo sirve como ícono adaptable.
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
