import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const token = request.cookies.get("pmoc_token")?.value;
    const { pathname } = request.nextUrl;

    if (pathname === "/") {
        return NextResponse.redirect(
            new URL(token ? "/dashboard" : "/login", request.url)
        );
    }

    if (token && pathname === "/login") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (
        !token &&
        pathname !== "/login" &&
        !pathname.startsWith("/api")
    ) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};