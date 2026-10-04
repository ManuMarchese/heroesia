import type { ReactNode } from "react";
import { NavegacionInferior } from "@/components/NavegacionInferior";

export default function LayoutApp({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <main className="pantalla pantalla--con-nav">{children}</main>
      <NavegacionInferior />
    </>
  );
}
