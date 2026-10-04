// Proxy de Next 16 (antes "middleware"): renueva la sesión de Supabase en cookies y hace el chequeo
// optimista de acceso (Q4). La verificación fuerte está en requireUser() y en la RLS de la base.
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { decidirAcceso } from "@/auth/rutas";
import { configSupabase, modoDemo } from "@/supabase/config";

const ENCABEZADOS_SIN_CACHE = ["cache-control", "expires", "pragma"];

export async function proxy(pedido: NextRequest) {
  const supabaseConfig = configSupabase();
  if (modoDemo() || !supabaseConfig) return NextResponse.next();

  let respuesta = NextResponse.next({ request: pedido });
  const supabase = createServerClient(supabaseConfig.url, supabaseConfig.clavePublicable, {
    cookies: {
      getAll() {
        return pedido.cookies.getAll();
      },
      setAll(aGuardar, encabezados) {
        for (const { name, value } of aGuardar) pedido.cookies.set(name, value);
        respuesta = NextResponse.next({ request: pedido });
        for (const { name, value, options } of aGuardar) respuesta.cookies.set(name, value, options);
        // Una respuesta que deja cookies de sesión no se puede guardar en caché compartida.
        for (const [clave, valor] of Object.entries(encabezados)) respuesta.headers.set(clave, valor);
      },
    },
  });

  // Antes de responder: si el token venció, getClaims lo renueva y setAll escribe las cookies nuevas.
  const { data } = await supabase.auth.getClaims();
  const decision = decidirAcceso({
    ruta: pedido.nextUrl.pathname,
    busqueda: pedido.nextUrl.search,
    hayUsuario: typeof data?.claims.sub === "string",
  });
  if (decision.tipo === "seguir") return respuesta;

  const redireccion = NextResponse.redirect(new URL(decision.destino, pedido.url));
  for (const cookie of respuesta.cookies.getAll()) redireccion.cookies.set(cookie);
  for (const clave of ENCABEZADOS_SIN_CACHE) {
    const valor = respuesta.headers.get(clave);
    if (valor) redireccion.headers.set(clave, valor);
  }
  return redireccion;
}

// Las licencias de las fuentes quedan públicas, igual que las fuentes que usa /entrar.
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|apple-icon.png|manifest.webmanifest|icons/|licencias/).*)"],
};
