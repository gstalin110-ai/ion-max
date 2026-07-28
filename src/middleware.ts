import { NextResponse, type NextRequest } from "next/server";
import { proxy } from "./proxy";

export async function middleware(request: NextRequest) {
  try {
    const response = await proxy(request);
    if (response) {
      return response;
    }
  } catch (error) {
    console.error("Error en el middleware proxy:", error);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
