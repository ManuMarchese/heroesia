import { describe, expect, it } from "vitest";
import { decidirAcceso } from "./rutas";
import {
  destinoSeguro,
  esCodigoValido,
  esEmailValido,
  normalizarCodigo,
  normalizarEmail,
  origenDelPedido,
} from "./validacion";

describe("email y código", () => {
  it("normaliza el email y lo valida", () => {
    expect(normalizarEmail("  Ana@Example.COM ")).toBe("ana@example.com");
    expect(normalizarEmail(null)).toBe("");
    expect(esEmailValido("ana@example.com")).toBe(true);
    for (const malo of ["", "ana", "ana@", "@example.com", "ana @example.com", `${"a".repeat(250)}@x.com`]) {
      expect(esEmailValido(malo), malo).toBe(false);
    }
  });

  it("acepta el código de 6 dígitos aunque venga con espacios o guiones", () => {
    expect(normalizarCodigo(" 123 456 ")).toBe("123456");
    expect(normalizarCodigo("123-456")).toBe("123456");
    expect(esCodigoValido("123456")).toBe(true);
    for (const malo of ["12345", "12345a", "", "１２３４５６"]) expect(esCodigoValido(malo), malo).toBe(false);
  });
});

describe("destinos seguros (sin redirecciones a otros sitios)", () => {
  it("deja pasar rutas internas con su búsqueda", () => {
    expect(destinoSeguro("/perfil")).toBe("/perfil");
    expect(destinoSeguro("/explorar?tipo=skill")).toBe("/explorar?tipo=skill");
  });

  it("descarta lo externo, lo raro y las rutas de acceso", () => {
    for (const malo of ["https://otro.com", "//otro.com", "/\\otro.com", "/\t/otro.com", "perfil", "", null, 3, "/entrar", "/auth/confirm"]) {
      expect(destinoSeguro(malo), String(malo)).toBe("/");
    }
  });
});

describe("origen del sitio para el link del mail", () => {
  const h = (valores: Record<string, string>) => new Headers(valores);
  it("usa Origin si está y si no, el host con su protocolo", () => {
    expect(origenDelPedido(h({ origin: "https://heroes.example.com" }))).toBe("https://heroes.example.com");
    expect(origenDelPedido(h({ host: "heroes.example.com", "x-forwarded-proto": "https" }))).toBe("https://heroes.example.com");
    expect(origenDelPedido(h({ host: "localhost:3000" }))).toBe("http://localhost:3000");
    expect(origenDelPedido(h({ host: "heroes.example.com" }))).toBe("https://heroes.example.com");
  });

  it("descarta valores sospechosos", () => {
    expect(origenDelPedido(h({}))).toBeNull();
    expect(origenDelPedido(h({ host: "otro.com/ruta" }))).toBeNull();
    expect(origenDelPedido(h({ origin: "null", host: "heroes.example.com" }))).toBe("https://heroes.example.com");
  });
});

describe("decisión del proxy", () => {
  it("sin sesión manda a /entrar y recuerda a dónde volver", () => {
    expect(decidirAcceso({ ruta: "/", hayUsuario: false })).toEqual({ tipo: "redirigir", destino: "/entrar" });
    expect(decidirAcceso({ ruta: "/perfil", busqueda: "?x=1", hayUsuario: false })).toEqual({
      tipo: "redirigir",
      destino: "/entrar?next=%2Fperfil%3Fx%3D1",
    });
  });

  it("deja pasar /entrar y /auth sin sesión, y todo con sesión", () => {
    expect(decidirAcceso({ ruta: "/entrar", hayUsuario: false })).toEqual({ tipo: "seguir" });
    expect(decidirAcceso({ ruta: "/auth/confirm", busqueda: "?token_hash=x", hayUsuario: false })).toEqual({ tipo: "seguir" });
    expect(decidirAcceso({ ruta: "/perfil", hayUsuario: true })).toEqual({ tipo: "seguir" });
  });

  it("con sesión, /entrar lleva al destino pedido o al inicio", () => {
    expect(decidirAcceso({ ruta: "/entrar", busqueda: "?next=%2Fexplorar", hayUsuario: true })).toEqual({
      tipo: "redirigir",
      destino: "/explorar",
    });
    expect(decidirAcceso({ ruta: "/entrar", busqueda: "?next=https://otro.com", hayUsuario: true })).toEqual({
      tipo: "redirigir",
      destino: "/",
    });
  });
});
