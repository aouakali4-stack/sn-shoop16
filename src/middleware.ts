import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ADMIN_ROUTES = [
  "/api/admin/auth/login",
  "/api/admin/auth/logout",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Exclude admin, API, maintenance, and static assets
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/maintenance") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next")
  ) {
    // ── ADMIN AUTH (unchanged) ──
    if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
      const token = request.cookies.get("sn-shop16-admin-token")?.value;
      if (!token) {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
    }

    if (pathname.startsWith("/api/admin")) {
      if (PUBLIC_ADMIN_ROUTES.includes(pathname)) {
        return NextResponse.next();
      }
      const token = request.cookies.get("sn-shop16-admin-token")?.value;
      if (!token) {
        return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
      }
    }

    return NextResponse.next();
  }

  // ── MAINTENANCE MODE (fetch from DB via API) ──
  try {
    const res = await fetch(new URL("/api/maintenance", request.url), {
      cache: "no-store",
    });

    if (res.ok) {
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const data = await res.json();
        if (data.maintenance_mode) {
          return NextResponse.redirect(new URL("/maintenance", request.url));
        }
      }
    }
  } catch {
    // Fallback: assume maintenance mode is off
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico).*)",
};
