import { getToken } from "next-auth/jwt";
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export const config = {
  matcher: "/",
};
export default withAuth(
  async function middleware(req) {
    const token = await getToken({ req });
    const loggedIn = !!token;
    console.log("LOGADO???", loggedIn);

    if (loggedIn) {
      req.nextUrl.pathname = "/dashboard";
      return NextResponse.redirect(req.nextUrl);
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      async authorized() {
        // This is a work-around for handling redirect on auth pages.
        // We return true here so that the middleware function above
        // is always called.
        return true;
      },
    },
  }
);
