import { describe, expect, it } from "vitest";
import { esIpBloqueada, esNombreBloqueado, gruposIpv6 } from "./ip";

describe("IPv4 bloqueadas (OWASP y rangos especiales)", () => {
  it.each([
    "127.0.0.1", "127.255.255.254", // loopback 127/8
    "10.0.0.1", "10.255.255.255", // 10/8
    "172.16.0.1", "172.31.255.255", // 172.16/12
    "192.168.0.1", "192.168.255.255", // 192.168/16
    "169.254.169.254", "169.254.0.1", // enlace local y metadata de la nube
    "0.0.0.0", "100.64.0.1", "100.127.255.255", "192.0.0.8", "192.0.2.1", "198.18.0.1", "198.51.100.7",
    "203.0.113.9", "224.0.0.1", "239.255.255.250", "240.0.0.1", "255.255.255.255",
  ])("%s", (ip) => {
    expect(esIpBloqueada(ip)).toBe(true);
  });

  it.each(["8.8.8.8", "1.1.1.1", "93.184.216.34", "172.15.255.255", "172.32.0.1", "100.63.255.255", "100.128.0.1", "192.169.0.1"])(
    "%s es pública",
    (ip) => {
      expect(esIpBloqueada(ip)).toBe(false);
    },
  );
});

describe("IPv6 bloqueadas", () => {
  it.each([
    "::", "::1", // sin especificar y loopback
    "::ffff:127.0.0.1", "::ffff:7f00:1", "::ffff:10.0.0.1", "::ffff:169.254.169.254", // IPv4 mapeadas
    "::127.0.0.1", // IPv4 compatible
    "fe80::1", "fe80::1%eth0", "febf::1", // enlace local
    "fc00::1", "fd12:3456:789a::1", // locales únicas
    "ff02::1", "ff05::2", // multicast
    "2001:db8::1", "2001::1", "2001:10::1", // documentación, Teredo, ORCHID
    "2002:7f00:1::1", // 6to4
    "64:ff9b::7f00:1", "64:ff9b::10.1.2.3", "64:ff9b:1::1", // NAT64 hacia redes locales
    "100::1", "3fff::1", "::ffff:0:0",
  ])("%s", (ip) => {
    expect(esIpBloqueada(ip)).toBe(true);
  });

  it.each(["2606:4700:4700::1111", "2001:4860:4860::8888", "2a00:1450:4001:80b::200e", "::ffff:8.8.8.8", "64:ff9b::808:808"])(
    "%s es pública",
    (ip) => {
      expect(esIpBloqueada(ip)).toBe(false);
    },
  );

  it("expande las formas cortas y con IPv4 al final", () => {
    expect(gruposIpv6("::1")).toEqual([0, 0, 0, 0, 0, 0, 0, 1]);
    expect(gruposIpv6("::ffff:1.2.3.4")).toEqual([0, 0, 0, 0, 0, 0xffff, 0x0102, 0x0304]);
    expect(gruposIpv6("1:2:3:4:5:6:7:8")).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(gruposIpv6("1::")).toEqual([1, 0, 0, 0, 0, 0, 0, 0]);
    expect(gruposIpv6("no es una ip")).toBeNull();
  });
});

describe("lo que no se entiende, se bloquea", () => {
  it.each(["", "abc", "999.1.1.1", "1.2.3", "1.2.3.4.5", "::g"])("%j", (ip) => {
    expect(esIpBloqueada(ip)).toBe(true);
  });
});

describe("nombres bloqueados", () => {
  it.each(["localhost", "LOCALHOST.", "app.localhost", "intranet", ""])("%j", (nombre) => {
    expect(esNombreBloqueado(nombre)).toBe(true);
  });

  it.each(["example.com", "github.com", "127.0.0.1", "::1"])("%j pasa al chequeo de IP", (nombre) => {
    expect(esNombreBloqueado(nombre)).toBe(false);
  });
});
