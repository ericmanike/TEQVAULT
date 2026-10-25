import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

interface JwtPayload {
  email?: string;
  role?: string;
  user_role?: string;
  app_metadata?: {
    role?: string;
    [key: string]: any;
  };
  user_metadata?: {
    role?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

function decodeJwtPayload(token?: string): JwtPayload | null {
  if (!token) return null;
  try {
    const payloadPart = token.split('.')[1];
    if (!payloadPart) return null;
    const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

function getUserRoleFromToken(token?: string): string | null {
  const payload = decodeJwtPayload(token);
  return (
    payload?.app_metadata?.role ||
    payload?.user_role ||
    payload?.role ||
    payload?.user_metadata?.role ||
    null
  );
}

export function proxy(req: NextRequest) {
  const token = req.cookies.get('token')?.value;

  const protectedRoutes = ["/seller", "/customer", "/chat", "/admin", "/cart/checkout"];

  const isProtected = protectedRoutes.some((route) =>
    req.nextUrl.pathname.startsWith(route)
  );

  // If unauthenticated, redirect to login first
  if (isProtected && !token) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("redirectTo", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin route authorization check (role-based)
  if (req.nextUrl.pathname.startsWith('/admin')) {
    const userRole = getUserRoleFromToken(token)?.toLowerCase();
    console.log('user role here',userRole)

    if (userRole !== 'admin') {
      console.log('not admin')
      return NextResponse.redirect(new URL("/shop", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/seller/:path*",
    "/customer/:path*",
    "/chat/:path*",
    "/admin/:path*",
    "/cart/checkout"
  ],
};
