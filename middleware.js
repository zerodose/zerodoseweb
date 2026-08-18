import { NextResponse } from "next/server";

export function middleware(request) {
  const pathname = request.nextUrl.pathname;

  if (pathname === "/worker/addzerodose") {
    // Middleware mein MongoDB directly use karna avoid karna better hai.
    // Campaign check API/server-side layout mein karna recommended hai.
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/worker/addzerodose"],
};
