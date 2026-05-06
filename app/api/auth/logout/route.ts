import { NextResponse } from "next/server";

function clearAuthCookie() {
  const response = NextResponse.json(
    { message: "Logged out successfully" },
    { status: 200 }
  );

  response.cookies.set("token", "", {
    httpOnly: true,
    path: "/",
    expires: new Date(0),
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}

export async function POST() {
  return clearAuthCookie();
}

export async function GET() {
  return clearAuthCookie();
}