import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    "/learn/:path*",
    "/practice/:path*",
    "/progress/:path*",
    "/settings/:path*",
    "/onboarding/:path*",
    "/certifications/:path*",
    "/clubs/:path*",
    "/community/:path*",
  ],
};
